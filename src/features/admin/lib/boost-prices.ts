import { z } from "zod";

import type { MoneyAmount } from "@/lib/money";

// FR-206/904: the upstream DTO uses JSON numbers. Stay below a magnitude at
// which their spacing could skip cents, and verify every decimal round trip.
const MAX_PRICE_CENTS = 2n ** 45n * 100n - 1n;
const durationDaysSchema = z.number().int().min(1).max(365);

function decimalCents(value: string): bigint | null {
  if (!/^\d{1,14}(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function boostPriceInput(price: MoneyAmount): string {
  const cents = BigInt(price.atomic);
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
}

export function parseBoostPrice(input: string): MoneyAmount | null {
  const raw = input.trim();
  const cents = decimalCents(raw);
  if (cents === null || cents <= 0n || cents > MAX_PRICE_CENTS) return null;
  // Conversion is only for the numeric wire format; there is no float arithmetic.
  if (decimalCents(String(Number(raw))) !== cents) return null;
  return { atomic: cents.toString(), currency: "USD", decimals: 2 };
}

const priceAmountSchema = z
  .object({
    atomic: z.string().regex(/^[1-9]\d{0,15}$/),
    currency: z.literal("USD"),
    decimals: z.literal(2),
  })
  .strict()
  .refine(
    (price) =>
      /^[1-9]\d{0,15}$/.test(price.atomic) &&
      parseBoostPrice(boostPriceInput(price))?.atomic === price.atomic,
    "The price cannot be represented exactly by the pricing service.",
  );

const priceInputSchema = z.string().transform((value, context) => {
  const price = parseBoostPrice(value);
  if (price) return price;
  context.addIssue({
    code: "custom",
    message:
      "Enter a positive USD price with up to two decimal places within the supported range.",
  });
  return z.NEVER;
});

const priceTierSchema = z.object({
  price: priceAmountSchema,
  durationDays: durationDaysSchema,
});
export const boostPricesSchema = z.object({
  basic: priceTierSchema,
  featured: priceTierSchema,
});
export type BoostPrices = z.infer<typeof boostPricesSchema>;

const wireTierSchema = z
  .object({
    priceUSD: z.number().positive(),
    durationDays: durationDaysSchema,
  })
  .transform((tier, context) => {
    const price = parseBoostPrice(String(tier.priceUSD));
    if (price) return { price, durationDays: tier.durationDays };
    context.addIssue({
      code: "custom",
      message: "The service returned an unsupported USD price.",
    });
    return z.NEVER;
  });

/** AdminController.getBoostPrices at API c3e23b0; OpenAPI omits this response. */
export const boostPricesResponseSchema = z.object({
  basic: wireTierSchema,
  featured: wireTierSchema,
});
export const boostPricesReceiptSchema = z.object({
  mode: z.literal("live"),
  prices: boostPricesSchema,
});

const tierUpdateSchema = z
  .object({
    price: priceAmountSchema.optional(),
    durationDays: durationDaysSchema.optional(),
  })
  .strict()
  .refine(
    (tier) => tier.price !== undefined || tier.durationDays !== undefined,
  );

/** Currency and integer cents are explicit across the browser/BFF boundary. */
export const boostPriceUpdateSchema = z
  .object({
    basic: tierUpdateSchema.optional(),
    featured: tierUpdateSchema.optional(),
  })
  .strict()
  .refine(
    (update) => update.basic !== undefined || update.featured !== undefined,
    "Change a price or duration before saving.",
  );
export type BoostPriceUpdate = z.infer<typeof boostPriceUpdateSchema>;

const daysInputSchema = z
  .string()
  .regex(/^\d{1,3}$/, "Enter a whole number of days from 1 to 365.")
  .transform(Number)
  .pipe(durationDaysSchema);
export const boostPriceFormSchema = z.object({
  basicPrice: priceInputSchema,
  basicDuration: daysInputSchema,
  featuredPrice: priceInputSchema,
  featuredDuration: daysInputSchema,
});
export type BoostPriceDraft = z.input<typeof boostPriceFormSchema>;

export function boostPriceDraft(prices: BoostPrices): BoostPriceDraft {
  return {
    basicPrice: boostPriceInput(prices.basic.price),
    basicDuration: String(prices.basic.durationDays),
    featuredPrice: boostPriceInput(prices.featured.price),
    featuredDuration: String(prices.featured.durationDays),
  };
}

/** Send changed fields only, so an untouched tier cannot overwrite another admin. */
export function changedBoostPrices(
  input: z.output<typeof boostPriceFormSchema>,
  current: BoostPrices,
): BoostPriceUpdate | null {
  const basic = {
    ...(input.basicPrice.atomic !== current.basic.price.atomic
      ? { price: input.basicPrice }
      : {}),
    ...(input.basicDuration !== current.basic.durationDays
      ? { durationDays: input.basicDuration }
      : {}),
  };
  const featured = {
    ...(input.featuredPrice.atomic !== current.featured.price.atomic
      ? { price: input.featuredPrice }
      : {}),
    ...(input.featuredDuration !== current.featured.durationDays
      ? { durationDays: input.featuredDuration }
      : {}),
  };
  const update = {
    ...(Object.keys(basic).length ? { basic } : {}),
    ...(Object.keys(featured).length ? { featured } : {}),
  };
  return Object.keys(update).length ? update : null;
}

/** Only this boundary converts exact USD decimals to the API's numeric DTO. */
export function boostPricesWireUpdate(update: BoostPriceUpdate) {
  return {
    ...(update.basic?.price
      ? { basicPriceUSD: Number(boostPriceInput(update.basic.price)) }
      : {}),
    ...(update.basic?.durationDays !== undefined
      ? { basicDurationDays: update.basic.durationDays }
      : {}),
    ...(update.featured?.price
      ? { featuredPriceUSD: Number(boostPriceInput(update.featured.price)) }
      : {}),
    ...(update.featured?.durationDays !== undefined
      ? { featuredDurationDays: update.featured.durationDays }
      : {}),
  };
}

export function matchesBoostPriceUpdate(
  prices: BoostPrices,
  update: BoostPriceUpdate,
): boolean {
  return (["basic", "featured"] as const).every((tier) => {
    const changed = update[tier];
    return (
      (!changed?.price || prices[tier].price.atomic === changed.price.atomic) &&
      (changed?.durationDays === undefined ||
        prices[tier].durationDays === changed.durationDays)
    );
  });
}
