"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { CountryFlag } from "@/components/ui/country-flag";
import { controlClass } from "@/components/ui/field";
import { countryName, searchCountries, type Country } from "@/lib/countries";

/**
 * A destination picker.
 *
 * A different control from `Select`, and deliberately so: that one is a short
 * pick-list you open and click, while this one holds 249 countries and is only
 * usable by typing. So the text input **is** the combobox — the pattern ARIA
 * describes — rather than a button that opens a list containing a search box.
 *
 * The country names come from `@/lib/countries`, which takes them from the
 * platform's own CLDR data and keeps the codes to ISO 3166-1 alpha-2. Nothing
 * here holds a name of its own, so there is no second list to drift.
 *
 * Typing "cote" finds Côte d’Ivoire and "gb" finds the United Kingdom. Whether a
 * chosen country is one the creator ships to is not this control's business: it
 * answers with a real country, and the flow decides what that country means.
 */
export function CountrySelect({
  describedBy,
  id,
  invalid = false,
  onChange,
  placeholder = "Search for a country",
  value,
}: {
  describedBy?: string;
  id?: string;
  invalid?: boolean;
  onChange: (code: string) => void;
  placeholder?: string;
  /** The chosen country, or empty. */
  value: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const optionId = (index: number) => `${inputId}-option-${index}`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRef = useRef<HTMLLIElement>(null);

  const selectedName = value ? (countryName(value) ?? value) : "";
  const matches = open ? searchCountries(query) : [];

  useEffect(() => {
    if (!open) return;
    activeRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  function openList() {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(country: Country) {
    onChange(country.code);
    close();
  }

  function moveActive(step: 1 | -1) {
    if (matches.length === 0) return;
    setActiveIndex(
      (current) => (current + step + matches.length) % matches.length,
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) moveActive(1);
        else openList();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (open) moveActive(-1);
        else openList();
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(Math.max(matches.length - 1, 0));
        break;
      case "Enter": {
        const match = matches[activeIndex];
        if (!open || !match) return;
        event.preventDefault();
        choose(match);
        break;
      }
      case "Escape":
        if (!open) return;
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  }

  return (
    <div className="relative">
      {open || value ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted"
        >
          {open ? (
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : (
            <CountryFlag code={value} />
          )}
        </span>
      ) : null}
      <input
        id={inputId}
        type="text"
        role="combobox"
        autoComplete="country-name"
        spellCheck={false}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-describedby={describedBy || undefined}
        aria-invalid={invalid || undefined}
        placeholder={placeholder}
        value={open ? query : selectedName}
        onChange={(event) => {
          if (!open) setOpen(true);
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onFocus={() => {
          if (!open) openList();
        }}
        onKeyDown={handleKeyDown}
        // `pointerdown` outside closes the list, like every other popup.
        onBlur={(event) => {
          if (
            !event.currentTarget.parentElement?.contains(event.relatedTarget)
          ) {
            close();
          }
        }}
        className={controlClass(invalid, open || value ? "pl-10" : "")}
      />

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Countries"
          className="absolute z-40 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[0_18px_48px_rgba(13,29,21,0.16)]"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              No countries match “{query}”.
            </li>
          ) : (
            matches.map((country, index) => {
              const selected = country.code === value;
              const active = index === activeIndex;

              return (
                <li
                  key={country.code}
                  ref={active ? activeRef : undefined}
                  id={optionId(index)}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActiveIndex(index)}
                  // Keep focus in the input so the list does not close on blur
                  // before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(country)}
                  className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-brand/8 text-ink" : "text-ink hover:bg-canvas"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CountryFlag code={country.code} />
                    <span className="truncate">
                      {country.name}{" "}
                      <span className="text-xs text-muted">{country.code}</span>
                    </span>
                  </span>
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={16}
                    strokeWidth={2.2}
                    aria-hidden="true"
                    className={`text-brand-strong ${selected ? "opacity-100" : "opacity-0"}`}
                  />
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
