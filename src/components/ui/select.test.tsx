import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "@/components/ui/select";

const options = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "disabled", label: "Unavailable", disabled: true },
] as const;

afterEach(cleanup);

describe("Select", () => {
  it("selects an option and provides its value to a parent form", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <label id="sort-label" htmlFor="sort">
          Sort
        </label>
        <Select
          id="sort"
          name="sort"
          aria-labelledby="sort-label"
          defaultValue="recent"
          options={options}
          onValueChange={onValueChange}
        />
      </form>,
    );

    fireEvent.click(screen.getByLabelText("Sort"));
    fireEvent.click(screen.getByRole("option", { name: "Oldest first" }));

    expect(onValueChange).toHaveBeenCalledWith("oldest");
    expect(container.querySelector('input[name="sort"]')).toHaveValue("oldest");
    expect(screen.getByLabelText("Sort")).toHaveTextContent("Oldest first");
  });

  it("supports arrow-key selection and ignores disabled options", () => {
    render(
      <Select
        aria-label="Sort ideas"
        defaultValue="recent"
        options={options}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Sort ideas" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(trigger).toHaveTextContent("Most recent");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes without changing value when Escape is pressed", () => {
    render(
      <Select aria-label="Topic" defaultValue="recent" options={options} />,
    );

    const trigger = screen.getByRole("combobox", { name: "Topic" });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Most recent");
  });
});
