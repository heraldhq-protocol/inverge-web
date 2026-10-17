import { describe, expect, it } from "vitest";

import { greetingFor, greetingForHour } from "@/features/home/lib/greeting";

describe("greetingForHour", () => {
  it("greets the morning before midday", () => {
    expect(greetingForHour(0)).toBe("Good morning");
    expect(greetingForHour(11)).toBe("Good morning");
  });

  it("greets the afternoon from midday to before five", () => {
    expect(greetingForHour(12)).toBe("Good afternoon");
    expect(greetingForHour(16)).toBe("Good afternoon");
  });

  it("greets the evening from five onward", () => {
    expect(greetingForHour(17)).toBe("Good evening");
    expect(greetingForHour(23)).toBe("Good evening");
  });
});

describe("greetingFor", () => {
  it("reads the hour from the supplied clock", () => {
    expect(greetingFor(new Date(2026, 9, 17, 8, 30))).toBe("Good morning");
    expect(greetingFor(new Date(2026, 9, 17, 20, 5))).toBe("Good evening");
  });
});
