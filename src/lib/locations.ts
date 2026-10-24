/**
 * Location entry and the regions Inverge can list without guessing.
 *
 * Country codes and names come from `@/lib/countries`. Region data comes from
 * `country-region-data` (MIT), which carries the ISO-3166-2 first-level
 * subdivisions for every country. That is the right shape for an address form:
 * states, provinces, regions, and departments, not a bundled city database.
 *
 * West Africa is the first validation target. The region data is ISO-3166-2 and
 * can lag a country's own reorganisations; where a name is known to be stale or
 * awkward for a launch market, `REGION_DISPLAY_OVERRIDES` corrects the display
 * and `REGION_ALIASES` keeps old stored values resolvable.
 *
 * The stored value remains one display string ("Ikeja, Lagos, Nigeria"). That
 * keeps the existing preview and API contracts unchanged; this module is the one
 * place that knows how to split it back into the three inputs.
 */

import { allCountries } from "country-region-data";

import {
  countryCodeFromName,
  countryName,
  normaliseCountryCode,
} from "@/lib/countries";

export type LocationParts = {
  city: string;
  /** ISO 3166-1 alpha-2, or empty when the stored label names no country. */
  countryCode: string;
  region: string;
};

const EMPTY_LOCATION: LocationParts = {
  city: "",
  countryCode: "",
  region: "",
};

/**
 * The ECOWAS member states, the first region the product is built for.
 *
 * This is a scope marker, not a restriction: every country remains selectable.
 * Mauritania is geographically West African but not an ECOWAS member, so it is
 * not in this list; its regions are still available from the full dataset.
 */
export const WEST_AFRICA_COUNTRY_CODES = [
  "BJ",
  "BF",
  "CV",
  "CI",
  "GM",
  "GH",
  "GN",
  "GW",
  "LR",
  "ML",
  "NE",
  "NG",
  "SN",
  "SL",
  "TG",
] as const;

export function isWestAfricaCountry(countryCode: string): boolean {
  const code = normaliseCountryCode(countryCode);
  return (
    code !== null &&
    (WEST_AFRICA_COUNTRY_CODES as readonly string[]).includes(code)
  );
}

/**
 * Region names that need a better display label than the ISO dataset's.
 *
 * The data source is deliberately not copied into this repository. These are
 * display corrections only; the region remains the same ISO subdivision.
 */
const REGION_DISPLAY_OVERRIDES: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  NG: {
    // The ISO name prefixes the territory with its best-known city; the form
    // labels the state-level region without turning Abuja into a separate state.
    "Abuja Federal Capital Territory": "Federal Capital Territory",
  },
  SN: {
    Kedougou: "Kédougou",
    Sedhiou: "Sédhiou",
    Thies: "Thiès",
  },
};

/**
 * Spellings a creator may already have stored, mapped to the display label.
 *
 * "Abuja" is deliberately not mapped: it is a city inside the Federal Capital
 * Territory, and treating it as the territory would silently replace the city.
 */
const REGION_ALIASES: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  NG: {
    fct: "Federal Capital Territory",
    "abuja federal capital territory": "Federal Capital Territory",
    nassarawa: "Nasarawa",
  },
  SN: {
    "saint louis": "Saint-Louis",
  },
};

const REGIONS_BY_COUNTRY: ReadonlyMap<string, readonly string[]> = new Map(
  allCountries.map(([, code, regions]) => {
    const overrides = REGION_DISPLAY_OVERRIDES[code] ?? {};
    return [code, regions.map(([name]) => overrides[name] ?? name)] as const;
  }),
);

function foldRegion(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function canonicalRegion(countryCode: string, value: string): string | null {
  const regions = REGIONS_BY_COUNTRY.get(countryCode);
  if (!regions) return null;

  const term = foldRegion(value);
  const alias = REGION_ALIASES[countryCode]?.[term];
  if (alias) return alias;

  const direct = regions.find((region) => foldRegion(region) === term);
  if (direct) return direct;

  // Creators write "Ogun State", "Ashanti Region", and "Lagos Province"; the
  // dataset stores the subdivision name without the administrative suffix.
  const withoutSuffix = term.replace(
    /\s+(state|region|province|department|county|district|prefecture|governorate|wilaya)$/,
    "",
  );
  return regions.find((region) => foldRegion(region) === withoutSuffix) ?? null;
}

/** The first-level region names for a country, or an empty list. */
export function regionNamesFor(countryCode: string): readonly string[] {
  const code = normaliseCountryCode(countryCode);
  return code ? (REGIONS_BY_COUNTRY.get(code) ?? []) : [];
}

/**
 * Split a stored location into the three inputs.
 *
 * The final comma-separated segment is the country when it is a country name or
 * ISO code. The segment before it is the region when it matches a region for
 * that country; everything before that is the city. A string with no recognised
 * country is kept whole as the city, so editing a legacy free-text value never
 * drops it.
 */
export function parseLocation(value: string): LocationParts {
  const segments = value
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) return EMPTY_LOCATION;

  const last = segments[segments.length - 1];
  if (!last) return EMPTY_LOCATION;

  const countryCode = normaliseCountryCode(last) ?? countryCodeFromName(last);
  if (!countryCode) {
    return { city: segments.join(", "), countryCode: "", region: "" };
  }

  const rest = segments.slice(0, -1);
  if (rest.length === 0) {
    return { city: "", countryCode, region: "" };
  }

  const possibleRegion = rest[rest.length - 1];
  if (!possibleRegion) return { city: "", countryCode, region: "" };

  const region = canonicalRegion(countryCode, possibleRegion);
  if (!region) {
    return { city: rest.join(", "), countryCode, region: "" };
  }

  return {
    city: rest.slice(0, -1).join(", "),
    countryCode,
    region,
  };
}

/**
 * Compose the display string in the order people write an address.
 *
 * A location with no country is returned as the city/region the creator typed
 * rather than being prefixed with a country we do not know.
 */
export function formatLocation(parts: LocationParts): string {
  const city = parts.city.trim();
  const region = parts.region.trim();
  const code = normaliseCountryCode(parts.countryCode);

  if (!code) {
    return [city, region].filter(Boolean).join(", ");
  }

  const country = countryName(code) ?? code;
  return [city, region, country].filter(Boolean).join(", ");
}
