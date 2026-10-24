import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CountrySelect } from "@/components/ui/country-select";

vi.mock("@/components/ui/country-flag", () => ({
  CountryFlag: ({ code }: { code: string }) => (
    <span aria-hidden="true" data-testid="country-flag">
      {code}
    </span>
  ),
}));

/**
 * The destination picker's keyboard and search contract.
 *
 * Every assertion here is about a way a backer can reach a country without a
 * mouse: focus, type, arrow, enter, escape. The control holds 249 destinations,
 * so a list that only moves by click would be unusable with a keyboard — which is
 * the reason the input *is* the combobox rather than a button that opens one.
 */
afterEach(cleanup);

function Harness({
  describedBy,
  invalid = false,
  onPick,
}: {
  describedBy?: string;
  invalid?: boolean;
  onPick?: (code: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <CountrySelect
      {...(describedBy ? { describedBy } : {})}
      invalid={invalid}
      onChange={(code) => {
        setValue(code);
        onPick?.(code);
      }}
      value={value}
    />
  );
}

function box() {
  return screen.getByRole("combobox");
}

describe("CountrySelect", () => {
  it("shows the placeholder until a country is chosen, then the country's name", () => {
    render(<Harness />);

    expect(box()).toHaveValue("");
    expect(box()).toHaveAttribute("placeholder", "Search for a country");

    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });
    fireEvent.click(screen.getByRole("option", { name: /Ghana/ }));

    expect(box()).toHaveValue("Ghana");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("announces itself as a collapsed combobox over a list, and expands on focus", () => {
    render(<Harness />);

    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveAttribute("aria-autocomplete", "list");
    expect(box()).not.toHaveAttribute("aria-activedescendant");

    fireEvent.focus(box());

    expect(box()).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("listbox", { name: "Countries" }),
    ).toBeInTheDocument();
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-option-0$/);
  });

  it("finds a country by its name whatever the accents", () => {
    render(<Harness />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "cote" } });

    expect(screen.getByRole("option", { name: /Ivoire/ })).toBeInTheDocument();
  });

  it("finds a country by its own code", () => {
    render(<Harness />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gb" } });

    const options = screen.getAllByRole("option");

    expect(options[0]?.textContent).toContain("United Kingdom");
  });

  it("moves the active option with the arrow keys and with Home", () => {
    render(<Harness />);
    fireEvent.focus(box());

    fireEvent.keyDown(box(), { key: "ArrowDown" });
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-option-1$/);

    fireEvent.keyDown(box(), { key: "ArrowDown" });
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-option-2$/);

    fireEvent.keyDown(box(), { key: "ArrowUp" });
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-option-1$/);

    fireEvent.keyDown(box(), { key: "Home" });
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-option-0$/);
  });

  it("takes the active option on Enter and reports its code", () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });

    fireEvent.keyDown(box(), { key: "Enter" });

    expect(onPick).toHaveBeenCalledWith("GH");
    expect(box()).toHaveValue("Ghana");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the chosen option as selected when the list is reopened", () => {
    render(<Harness />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });
    fireEvent.keyDown(box(), { key: "Enter" });

    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });

    expect(screen.getByRole("option", { name: /Ghana/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("closes on Escape without choosing anything", () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });

    fireEvent.keyDown(box(), { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onPick).not.toHaveBeenCalled();
    expect(box()).toHaveValue("");
  });

  it("closes on Tab without choosing anything, so focus moves on", () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    fireEvent.focus(box());

    fireEvent.keyDown(box(), { key: "Tab" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onPick).not.toHaveBeenCalled();
  });

  it("says so, in words, when nothing matches what was typed", () => {
    render(<Harness />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "zzzz" } });

    expect(screen.getByText(/No countries match/)).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("shows a decorative flag for the chosen country", () => {
    render(<Harness />);
    fireEvent.focus(box());
    fireEvent.change(box(), { target: { value: "gh" } });
    fireEvent.keyDown(box(), { key: "Enter" });

    expect(screen.getByTestId("country-flag")).toHaveTextContent("GH");
  });

  it("carries the caller's invalid state and description onto the input", () => {
    render(<Harness describedBy="destination-help" invalid />);

    expect(box()).toHaveAttribute("aria-invalid", "true");
    expect(box()).toHaveAttribute("aria-describedby", "destination-help");
  });
});
