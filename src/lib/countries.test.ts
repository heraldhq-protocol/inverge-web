import { describe, expect, it } from "vitest";

import {
  countries,
  countryName,
  isCountryCode,
  normaliseCountryCode,
  searchCountries,
} from "@/lib/countries";

/**
 * The destination list's two jobs: never offer something that is not a place,
 * and never make a backer hunt for a country that is.
 *
 * The first assertion is the important one. The codes are written by hand, so
 * the test asks the platform to name every one of them; a typo has no CLDR name
 * and fails here rather than rendering as a raw code to a backer in another
 * country.
 */

describe("countries", () => {
  it("names every code it lists, so no code can be a typo", () => {
    const unnamed = countries().filter(
      (country) => !country.name || country.name === country.code,
    );

    expect(unnamed).toEqual([]);
  });

  it("lists a comprehensive set of real destinations", () => {
    expect(countries().length).toBeGreaterThan(200);
    expect(new Set(countries().map((country) => country.code)).size).toBe(
      countries().length,
    );

    for (const country of countries()) {
      expect(country.code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("leaves out withdrawn codes, CLDR aggregates, and private-use codes", () => {
    for (const notACountry of [
      "AN",
      "SU",
      "YU",
      "ZR",
      "DD",
      "BU",
      "EU",
      "EZ",
      "QO",
      "UN",
      "UK",
      "XA",
      "XB",
      "ZZ",
    ]) {
      expect(isCountryCode(notACountry)).toBe(false);
    }
  });

  it("has the right country behind each of a sample of codes", () => {
    expect(countryName("NG")).toBe("Nigeria");
    expect(countryName("GH")).toBe("Ghana");
    expect(countryName("SN")).toBe("Senegal");
    expect(countryName("KE")).toBe("Kenya");
    expect(countryName("GB")).toBe("United Kingdom");
    expect(countryName("US")).toBe("United States");
    expect(countryName("CA")).toBe("Canada");
    expect(countryName("DE")).toBe("Germany");
    expect(countryName("FR")).toBe("France");
    expect(countryName("BR")).toBe("Brazil");
    expect(countryName("IN")).toBe("India");
    expect(countryName("JP")).toBe("Japan");
    expect(countryName("AU")).toBe("Australia");
    expect(countryName("ZA")).toBe("South Africa");
  });

  it("is ordered by name, so a listbox reads as a list", () => {
    const names = countries().map((country) => country.name);
    const sorted = [...names].sort((left, right) =>
      new Intl.Collator("en").compare(left, right),
    );

    expect(names).toEqual(sorted);
  });
});

describe("normaliseCountryCode", () => {
  it("upper-cases and trims a real code", () => {
    expect(normaliseCountryCode(" gb ")).toBe("GB");
  });

  it("refuses anything that is not a destination", () => {
    expect(normaliseCountryCode("ZZ")).toBeNull();
    expect(normaliseCountryCode("Nigeria")).toBeNull();
    expect(normaliseCountryCode("")).toBeNull();
  });
});

describe("searchCountries", () => {
  it("finds a country by the start of its name", () => {
    const codes = searchCountries("nige").map((country) => country.code);

    expect(codes).toContain("NG");
    expect(codes).toContain("NE");
  });

  it("finds a country by its code", () => {
    expect(searchCountries("gb")[0]?.name).toBe("United Kingdom");
  });

  it("finds every country sharing a word", () => {
    const names = searchCountries("united").map((country) => country.name);

    expect(names).toContain("United Kingdom");
    expect(names).toContain("United States");
    expect(names).toContain("United Arab Emirates");
  });

  it("does not require the backer to spell an accent", () => {
    expect(searchCountries("cote").map((country) => country.code)).not.toEqual(
      [],
    );
  });

  it("shows the top of the list for an empty term rather than everything", () => {
    expect(searchCountries("", 5)).toHaveLength(5);
  });
});
