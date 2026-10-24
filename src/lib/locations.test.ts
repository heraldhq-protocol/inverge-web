import { describe, expect, it } from "vitest";

import {
  formatLocation,
  isWestAfricaCountry,
  parseLocation,
  regionNamesFor,
  WEST_AFRICA_COUNTRY_CODES,
} from "@/lib/locations";

/**
 * West Africa is the first validation target. These assertions cover the three
 * launch markets in detail and the wider ECOWAS list at the level the form
 * needs: a real country must produce real first-level regions, not a guessed
 * or empty list.
 */
describe("regions", () => {
  it("covers the Nigerian states the product launches with", () => {
    const regions = regionNamesFor("NG");

    expect(regions).toHaveLength(37);
    expect(regions).toContain("Lagos");
    expect(regions).toContain("Delta");
    expect(regions).toContain("Imo");
    expect(regions).toContain("Federal Capital Territory");
  });

  it("covers Ghana's 16 regions and Senegal's 14", () => {
    expect(regionNamesFor("GH")).toHaveLength(16);
    expect(regionNamesFor("GH")).toContain("Greater Accra");

    expect(regionNamesFor("SN")).toHaveLength(14);
    expect(regionNamesFor("SN")).toContain("Dakar");
    expect(regionNamesFor("SN")).toContain("Kédougou");
    expect(regionNamesFor("SN")).toContain("Sédhiou");
    expect(regionNamesFor("SN")).toContain("Thiès");
  });

  it("has a real region list for every ECOWAS member", () => {
    for (const code of WEST_AFRICA_COUNTRY_CODES) {
      expect(regionNamesFor(code).length, code).toBeGreaterThan(0);
    }
  });

  it("normalises the country code and refuses unknown countries", () => {
    expect(regionNamesFor(" ng ")).toEqual(regionNamesFor("NG"));
    expect(regionNamesFor("ZZ")).toEqual([]);
    expect(regionNamesFor("")).toEqual([]);
  });

  it("identifies West African countries without narrowing the country list", () => {
    expect(WEST_AFRICA_COUNTRY_CODES).toHaveLength(15);
    expect(isWestAfricaCountry("NG")).toBe(true);
    expect(isWestAfricaCountry("gh")).toBe(true);
    expect(isWestAfricaCountry("MR")).toBe(false);
    expect(isWestAfricaCountry("ZZ")).toBe(false);
  });
});

describe("parseLocation", () => {
  it("splits a city, region, and country in address order", () => {
    expect(parseLocation("Ikeja, Lagos, Nigeria")).toEqual({
      city: "Ikeja",
      countryCode: "NG",
      region: "Lagos",
    });
  });

  it("accepts the region without a city", () => {
    expect(parseLocation("Lagos, Nigeria")).toEqual({
      city: "",
      countryCode: "NG",
      region: "Lagos",
    });
  });

  it("accepts an ISO country code in the final segment", () => {
    expect(parseLocation("Ikeja, Lagos, NG")).toEqual({
      city: "Ikeja",
      countryCode: "NG",
      region: "Lagos",
    });
  });

  it("removes the administrative suffix when matching a region", () => {
    expect(parseLocation("Ogun State, Nigeria")).toEqual({
      city: "",
      countryCode: "NG",
      region: "Ogun",
    });
  });

  it("treats a city that is not a region as the city", () => {
    expect(parseLocation("Abuja, Nigeria")).toEqual({
      city: "Abuja",
      countryCode: "NG",
      region: "",
    });
    expect(parseLocation("Munich, Germany")).toEqual({
      city: "Munich",
      countryCode: "DE",
      region: "",
    });
  });

  it("matches a city and region for a country outside West Africa", () => {
    expect(parseLocation("Los Angeles, California, United States")).toEqual({
      city: "Los Angeles",
      countryCode: "US",
      region: "California",
    });
  });

  it("canonicalises a stored region label", () => {
    expect(parseLocation("FCT, Nigeria").region).toBe(
      "Federal Capital Territory",
    );
    expect(parseLocation("Kedougou, Senegal").region).toBe("Kédougou");
  });

  it("understands a country name without requiring an accent", () => {
    expect(parseLocation("Côte d’Ivoire")).toEqual({
      city: "",
      countryCode: "CI",
      region: "",
    });
    expect(parseLocation("Cote d'Ivoire")).toEqual({
      city: "",
      countryCode: "CI",
      region: "",
    });
  });

  it("keeps a legacy value whole when it names no country", () => {
    expect(parseLocation("Remote")).toEqual({
      city: "Remote",
      countryCode: "",
      region: "",
    });
  });

  it("treats an empty string as an empty location", () => {
    expect(parseLocation("")).toEqual({
      city: "",
      countryCode: "",
      region: "",
    });
    expect(parseLocation("   ")).toEqual({
      city: "",
      countryCode: "",
      region: "",
    });
  });
});

describe("formatLocation", () => {
  it("writes the address in city, region, country order", () => {
    expect(
      formatLocation({ city: "Ikeja", countryCode: "NG", region: "Lagos" }),
    ).toBe("Ikeja, Lagos, Nigeria");
  });

  it("does not leave an empty separator", () => {
    expect(
      formatLocation({ city: "", countryCode: "NG", region: "Lagos" }),
    ).toBe("Lagos, Nigeria");
    expect(
      formatLocation({ city: "Munich", countryCode: "DE", region: "" }),
    ).toBe("Munich, Germany");
    expect(formatLocation({ city: "", countryCode: "NG", region: "" })).toBe(
      "Nigeria",
    );
  });

  it("returns a country-less value as the creator typed it", () => {
    expect(
      formatLocation({ city: "Remote", countryCode: "", region: "" }),
    ).toBe("Remote");
    expect(formatLocation({ city: "", countryCode: "", region: "" })).toBe("");
  });

  it("round-trips a complete location", () => {
    const value = "Ikeja, Lagos, Nigeria";

    expect(formatLocation(parseLocation(value))).toBe(value);
  });

  it("round-trips through the canonical region label", () => {
    expect(formatLocation(parseLocation("Kedougou, Senegal"))).toBe(
      "Kédougou, Senegal",
    );
  });
});
