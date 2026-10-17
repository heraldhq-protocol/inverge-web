import type { MoneyAmount } from "@/lib/money";
import type { SponsorInvoiceStatus } from "@/features/programmes/types";

/**
 * Money domains.
 *
 * Subscriptions, promotions, sponsor invoices, workshop tickets, prize
 * fulfilment, and crowdfunding contributions are deliberately separate. They
 * have different authorities, receipts, and failure modes, and merging them into
 * one generic transaction state would make reconciliation impossible.
 *
 * Every state change that means "money arrived" requires a verified provider
 * event. A client redirect, a button click, or an admin optimism is not proof.
 */

export type PlanId = "free" | "pro" | "studio";

export type Plan = {
  id: PlanId;
  name: string;
  /** Monthly price, or null for the free plan. */
  price: MoneyAmount | null;
  aiAnalysesPerMonth: number;
  features: readonly string[];
  /** Illustrative pricing, not a confirmed commercial decision. */
  pricingConfirmed: boolean;
};

export type AiUsage = {
  plan: PlanId;
  allowance: number;
  used: number;
  resetsAt: string;
};

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type Subscription = {
  id: string;
  accountId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  renewsAt?: string | undefined;
  canceledAt?: string | undefined;
  provider: string | null;
  providerConfirmed: boolean;
};

export type PromotionStatus =
  | "pending_payment"
  | "active"
  | "expired"
  | "refunded";

export type Promotion = {
  id: string;
  ideaId: string;
  tier: "basic" | "featured";
  status: PromotionStatus;
  startsAt?: string | undefined;
  endsAt?: string | undefined;
  charge: MoneyAmount;
  /** Promotion affects discovery surfacing only. */
  affectsValidationMetrics: false;
};

export type WorkshopBookingStatus =
  | "reserved"
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "refunded";

export type WorkshopBooking = {
  id: string;
  sessionId: string;
  participant: string;
  status: WorkshopBookingStatus;
  seats: number;
  amount: MoneyAmount;
  provider: string | null;
  providerConfirmed: boolean;
};

export type PaymentProviderEvent = {
  id: string;
  provider: string;
  /** Only a verified webhook may advance a payment state. */
  verified: boolean;
  eventId: string;
  amount: MoneyAmount;
  receivedAt: string;
};

export type PrizeStatus =
  | "committed"
  | "funded"
  | "eligibility_pending"
  | "approved"
  | "processing"
  | "delivered"
  | "failed";

export const PLANS: Readonly<Record<PlanId, Plan>> = {
  free: {
    id: "free",
    name: "Free",
    price: null,
    aiAnalysesPerMonth: 0,
    features: [
      "Publish ideas",
      "Configurable feedback forms",
      "Basic support, interest, and feedback analytics",
      "Community links",
    ],
    pricingConfirmed: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: { atomic: "300000", currency: "USD", decimals: 2 },
    aiAnalysesPerMonth: 10,
    features: [
      "Everything in Free",
      "AI feedback themes and summaries",
      "Evidence-gap analysis",
      "Suggested validation experiments",
      "Exportable validation report",
    ],
    pricingConfirmed: false,
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: { atomic: "900000", currency: "USD", decimals: 2 },
    aiAnalysesPerMonth: 50,
    features: [
      "Everything in Pro",
      "Higher analysis allowance",
      "Multiple ideas under one workspace",
      "Priority support",
    ],
    pricingConfirmed: false,
  },
};

const SUBSCRIPTION_TRANSITIONS: Readonly<
  Record<SubscriptionStatus, readonly SubscriptionStatus[]>
> = {
  incomplete: ["active", "canceled"],
  trialing: ["active", "canceled", "past_due"],
  active: ["past_due", "canceled"],
  past_due: ["active", "canceled"],
  canceled: [],
};

export function canTransitionSubscription(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): boolean {
  return SUBSCRIPTION_TRANSITIONS[from].includes(to);
}

/**
 * A subscription becomes active only when the provider confirms it. A local
 * "upgrade" click produces `incomplete`, never `active`.
 */
export function beginSubscription(accountId: string, plan: PlanId): Subscription {
  return {
    accountId,
    id: `sub_${accountId}_${plan}`,
    plan,
    provider: null,
    providerConfirmed: false,
    status: "incomplete",
  };
}

export function confirmSubscription(
  subscription: Subscription,
  event: PaymentProviderEvent,
): Subscription {
  if (!event.verified) {
    throw new Error("A subscription needs a verified provider event.");
  }
  if (!canTransitionSubscription(subscription.status, "active")) {
    throw new Error(`Cannot activate a ${subscription.status} subscription.`);
  }
  return {
    ...subscription,
    provider: event.provider,
    providerConfirmed: true,
    renewsAt: new Date(
      new Date(event.receivedAt).getTime() + 30 * 86_400_000,
    ).toISOString(),
    status: "active",
  };
}

export function cancelSubscription(
  subscription: Subscription,
  now: Date = new Date(),
): Subscription {
  if (!canTransitionSubscription(subscription.status, "canceled")) {
    return subscription;
  }
  return {
    ...subscription,
    canceledAt: now.toISOString(),
    status: "canceled",
  };
}

export function aiAllowance(usage: AiUsage): {
  remaining: number;
  allowed: boolean;
  plan: PlanId;
} {
  const remaining = Math.max(0, usage.allowance - usage.used);
  return {
    allowed: usage.plan !== "free" && remaining > 0,
    plan: usage.plan,
    remaining,
  };
}

const PROMOTION_TRANSITIONS: Readonly<
  Record<PromotionStatus, readonly PromotionStatus[]>
> = {
  pending_payment: ["active", "refunded"],
  active: ["expired", "refunded"],
  expired: [],
  refunded: [],
};

export function canTransitionPromotion(
  from: PromotionStatus,
  to: PromotionStatus,
): boolean {
  return PROMOTION_TRANSITIONS[from].includes(to);
}

export function activatePromotion(
  promotion: Promotion,
  event: PaymentProviderEvent,
  now: Date = new Date(),
): Promotion {
  if (!event.verified) {
    throw new Error("A promotion needs a verified provider event.");
  }
  if (!canTransitionPromotion(promotion.status, "active")) {
    throw new Error(`Cannot activate a ${promotion.status} promotion.`);
  }
  const days = promotion.tier === "featured" ? 30 : 7;
  return {
    ...promotion,
    affectsValidationMetrics: false,
    endsAt: new Date(now.getTime() + days * 86_400_000).toISOString(),
    startsAt: now.toISOString(),
    status: "active",
  };
}

const BOOKING_TRANSITIONS: Readonly<
  Record<WorkshopBookingStatus, readonly WorkshopBookingStatus[]>
> = {
  reserved: ["pending_payment", "cancelled"],
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["refunded", "cancelled"],
  cancelled: [],
  refunded: [],
};

export function canTransitionBooking(
  from: WorkshopBookingStatus,
  to: WorkshopBookingStatus,
): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}

export function confirmBooking(
  booking: WorkshopBooking,
  event: PaymentProviderEvent,
): WorkshopBooking {
  if (!event.verified) {
    throw new Error("A paid booking needs a verified provider event.");
  }
  if (booking.amount.atomic !== event.amount.atomic) {
    throw new Error("The confirmed amount does not match the booking amount.");
  }
  if (!canTransitionBooking(booking.status, "confirmed")) {
    throw new Error(`Cannot confirm a ${booking.status} booking.`);
  }
  return {
    ...booking,
    provider: event.provider,
    providerConfirmed: true,
    status: "confirmed",
  };
}

/**
 * Sponsor invoices follow the status vocabulary in the programme model. Offline
 * bank transfers can be recorded during the pilot, but only an explicit
 * `confirmed` flag with a reference advances the invoice to paid.
 */
export function markInvoicePaid(
  status: SponsorInvoiceStatus,
  confirmation: {
    method: "provider" | "offline_transfer";
    reference: string;
    verified: boolean;
  },
): SponsorInvoiceStatus {
  if (status === "paid" || status === "cancelled") return status;
  if (status === "draft") return status;
  if (!confirmation.verified || !confirmation.reference.trim()) {
    return status;
  }
  return "paid";
}

const PRIZE_TRANSITIONS: Readonly<Record<PrizeStatus, readonly PrizeStatus[]>> = {
  committed: ["funded", "failed"],
  funded: ["eligibility_pending", "failed"],
  eligibility_pending: ["approved", "failed"],
  approved: ["processing", "failed"],
  processing: ["delivered", "failed"],
  delivered: [],
  failed: [],
};

export function canAdvancePrize(from: PrizeStatus, to: PrizeStatus): boolean {
  return PRIZE_TRANSITIONS[from].includes(to);
}

export function advancePrize(
  from: PrizeStatus,
  to: PrizeStatus,
  evidence?: string,
): PrizeStatus {
  if (!canAdvancePrize(from, to)) return from;
  if (to === "delivered" && !evidence?.trim()) return from;
  return to;
}

/** Idempotent webhook handling: the same event id is processed once. */
export function processProviderEvent(
  processed: ReadonlySet<string>,
  event: PaymentProviderEvent,
): { duplicate: boolean; processed: Set<string> } {
  if (processed.has(event.eventId)) {
    return { duplicate: true, processed: new Set(processed) };
  }
  if (!event.verified) {
    throw new Error("Unverified provider events are rejected.");
  }
  const next = new Set(processed);
  next.add(event.eventId);
  return { duplicate: false, processed: next };
}
