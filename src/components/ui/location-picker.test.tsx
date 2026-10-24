import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocationPicker } from "@/components/ui/location-picker";

vi.mock("@/components/ui/country-flag", () => ({
  CountryFlag: ({ code }: { code: string }) => (
    <span aria-hidden="true" data-testid="country-flag">
      {code}
    </span>
  ),
}));

afterEach(cleanup);

function Harness({
  initial,
  onChange,
}: {
  initial: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <LocationPicker
      label="Where you are"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function countryBox() {
  return screen.getByLabelText("Country");
}

function regionBox() {
  return screen.getByLabelText("Region / state");
}

function cityBox() {
  return screen.getByLabelText(/City/);
}

describe("LocationPicker", () => {
  it("renders a stored location as country, region, and city", () => {
    render(<Harness initial="Ikeja, Lagos, Nigeria" />);

    expect(countryBox()).toHaveValue("Nigeria");
    expect(regionBox()).toHaveTextContent("Lagos");
    expect(cityBox()).toHaveValue("Ikeja");
  });

  it("offers the Nigerian states a creator expects", () => {
    render(<Harness initial="Lagos, Nigeria" />);

    fireEvent.click(regionBox());

    expect(screen.getByRole("option", { name: "Delta" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Imo" })).toBeInTheDocument();
  });

  it("keeps typed city text from being re-read as a region", () => {
    const onChange = vi.fn();
    render(<Harness initial="Lagos, Nigeria" onChange={onChange} />);

    fireEvent.change(cityBox(), { target: { value: "Lekki" } });

    expect(onChange).toHaveBeenLastCalledWith("Lekki, Lagos, Nigeria");
  });

  it("selects a region for a country with a region list", () => {
    const onChange = vi.fn();
    render(<Harness initial="Munich, Germany" onChange={onChange} />);

    fireEvent.click(regionBox());
    fireEvent.click(screen.getByRole("option", { name: "Bayern" }));

    expect(onChange).toHaveBeenLastCalledWith("Munich, Bayern, Germany");
  });

  it("clears a region that does not belong to the newly selected country", () => {
    const onChange = vi.fn();
    render(<Harness initial="Ikeja, Lagos, Nigeria" onChange={onChange} />);

    fireEvent.focus(countryBox());
    fireEvent.change(countryBox(), { target: { value: "ghana" } });
    fireEvent.click(screen.getByRole("option", { name: /Ghana/ }));

    expect(onChange).toHaveBeenLastCalledWith("Ikeja, Ghana");
  });

  it("keeps a legacy value editable when no country is known", () => {
    const onChange = vi.fn();
    render(<Harness initial="Remote" onChange={onChange} />);

    expect(countryBox()).toHaveValue("");
    expect(regionBox()).toBeDisabled();

    fireEvent.change(cityBox(), { target: { value: "Remote team" } });

    expect(onChange).toHaveBeenLastCalledWith("Remote team");
  });

  it("resets the inputs when the parent loads a different location", () => {
    function ResettingHarness() {
      const [value, setValue] = useState("Ikeja, Lagos, Nigeria");

      return (
        <>
          <button
            type="button"
            onClick={() => setValue("Greater Accra, Ghana")}
          >
            Load
          </button>
          <LocationPicker
            label="Where you are"
            value={value}
            onChange={setValue}
          />
        </>
      );
    }

    render(<ResettingHarness />);
    expect(countryBox()).toHaveValue("Nigeria");

    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    expect(countryBox()).toHaveValue("Ghana");
    expect(regionBox()).toHaveTextContent("Greater Accra");
    expect(cityBox()).toHaveValue("");
  });

  it("links the error and help text to the country control", () => {
    render(
      <LocationPicker
        label="Where you are"
        help="Choose where you are based."
        error="This is required."
        value=""
        onChange={() => {}}
      />,
    );

    const describedBy = countryBox().getAttribute("aria-describedby") ?? "";

    expect(countryBox()).toHaveAttribute("aria-invalid", "true");
    expect(describedBy).toContain("-help");
    expect(describedBy).toContain("-error");
    expect(screen.getByText("This is required.")).toBeInTheDocument();
  });
});
