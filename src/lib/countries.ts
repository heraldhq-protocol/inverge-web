/**
 * The countries and territories a destination can be named as.
 *
 * Two things are deliberately kept apart here. The **codes** are ISO 3166-1
 * alpha-2 and are written out below, because the alternative — walking every
 * two-letter combination and asking the platform whether it is a region — also
 * returns withdrawn codes (`AN` Netherlands Antilles, `SU`, `ZR`), CLDR
 * aggregates (`EU`, `EZ`, `QO`, `UN`), and private-use codes (`XA`, `XB`, `ZZ`).
 * A shipping destination must not be "Netherlands Antilles". The **names** come
 * from the platform's own CLDR data at runtime rather than from a table we would
 * have to keep, so a name is never a stale transliteration and never a typo we
 * introduced.
 *
 * `countries.test.ts` fails if a code here is not a region CLDR knows, which is
 * what makes a hand-written list safe: a mistyped code has no name and the suite
 * refuses it. Adding a newly assigned code is one word.
 *
 * This is a data module, not a UI list. No component holds its own country
 * names, and no destination is ever a free-text string.
 */

export type Country = {
  /** ISO 3166-1 alpha-2, upper case. */
  code: string;
  /** The English CLDR name, e.g. "Côte d’Ivoire", "United Kingdom". */
  name: string;
};

const COUNTRY_CODES = `
  AD AE AF AG AI AL AM AO
  AQ AR AS AT AU AW AX AZ
  BA BB BD BE BF BG BH BI
  BJ BL BM BN BO BQ BR BS
  BT BV BW BY BZ CA CC CD
  CF CG CH CI CK CL CM CN
  CO CR CU CV CW CX CY CZ
  DE DJ DK DM DO DZ EC EE
  EG EH ER ES ET FI FJ FK
  FM FO FR GA GB GD GE GF
  GG GH GI GL GM GN GP GQ
  GR GS GT GU GW GY HK HM
  HN HR HT HU ID IE IL IM
  IN IO IQ IR IS IT JE JM
  JO JP KE KG KH KI KM KN
  KP KR KW KY KZ LA LB LC
  LI LK LR LS LT LU LV LY
  MA MC MD ME MF MG MH MK
  ML MM MN MO MP MQ MR MS
  MT MU MV MW MX MY MZ NA
  NC NE NF NG NI NL NO NP
  NR NU NZ OM PA PE PF PG
  PH PK PL PM PN PR PS PT
  PW PY QA RE RO RS RU RW
  SA SB SC SD SE SG SH SI
  SJ SK SL SM SN SO SR SS
  ST SV SX SY SZ TC TD TF
  TG TH TJ TK TL TM TN TO
  TR TT TV TW TZ UA UG UM
  US UY UZ VA VC VE VG VI
  VN VU WF WS YE YT ZA ZM
  ZW
`
  .trim()
  .split(/\s+/);

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const collator = new Intl.Collator("en");

function build(): readonly Country[] {
  const built = COUNTRY_CODES.map((code) => {
    // `?? code` can only happen for a code CLDR has dropped; the test suite
    // fails on it, and until then the code itself is a better label than a blank.
    const name = displayNames.of(code) ?? code;
    return { code, name };
  });

  return built.sort((left, right) => collator.compare(left.name, right.name));
}

const ORDERED = build();
const BY_CODE = new Map(ORDERED.map((country) => [country.code, country]));

/** Every destination, ordered by English name. */
export function countries(): readonly Country[] {
  return ORDERED;
}

export function isCountryCode(value: string): boolean {
  return BY_CODE.has(value);
}

export function countryName(code: string): string | null {
  return BY_CODE.get(code)?.name ?? null;
}

/**
 * A country code from untrusted input — a query string, a stored value.
 *
 * Returns the upper-cased code when it is a real destination and `null`
 * otherwise, so a caller can never end up rendering a country that does not
 * exist or comparing destinations in two different cases.
 */
export function normaliseCountryCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  return BY_CODE.has(code) ? code : null;
}

/**
 * Folds a name to its unaccented lower-case form, so a backer can find
 * "Côte d’Ivoire" by typing "cote" and "Türkiye" by typing "turkiye".
 * Diacritics are decoration on a search key, not a spelling test.
 */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Countries matching a search term, best matches first.
 *
 * A name that starts with the term beats a name that merely contains it, and an
 * exact code beats both, so typing "GB" finds the United Kingdom. An empty term
 * is the top of the list rather than every country, which is what keeps a
 * 249-item listbox renderable.
 */
export function searchCountries(query: string, limit = 40): readonly Country[] {
  const term = fold(query.trim());
  if (!term) return ORDERED.slice(0, limit);

  const exactCode: Country[] = [];
  const startsWith: Country[] = [];
  const contains: Country[] = [];

  for (const country of ORDERED) {
    if (country.code.toLowerCase() === term) {
      exactCode.push(country);
      continue;
    }

    const name = fold(country.name);

    if (name.startsWith(term) || country.code.toLowerCase().startsWith(term)) {
      startsWith.push(country);
    } else if (name.includes(term)) {
      contains.push(country);
    }
  }

  return [...exactCode, ...startsWith, ...contains].slice(0, limit);
}
