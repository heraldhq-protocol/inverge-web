"use client";

import { Check, ChevronDown } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

type SelectProps = {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  value?: string;
};

export function Select({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className = "",
  defaultValue = "",
  disabled = false,
  id,
  name,
  onValueChange,
  options,
  placeholder = "Select an option",
  value,
}: SelectProps) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isOpen]);

  function firstEnabledIndex() {
    const index = options.findIndex((option) => !option.disabled);
    return index < 0 ? 0 : index;
  }

  function openListbox(direction: "first" | "last" = "first") {
    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue && !option.disabled,
    );
    const lastEnabledIndex = options.findLastIndex(
      (option) => !option.disabled,
    );
    const fallbackIndex =
      direction === "last" && lastEnabledIndex >= 0
        ? lastEnabledIndex
        : firstEnabledIndex();

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : fallbackIndex);
    setIsOpen(true);
  }

  function moveActive(step: 1 | -1) {
    if (options.length === 0) return;

    let nextIndex = activeIndex;
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      nextIndex = (nextIndex + step + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;

    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (isOpen) moveActive(1);
        else openListbox("first");
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) moveActive(-1);
        else openListbox("last");
        break;
      case "Home":
        if (!isOpen) return;
        event.preventDefault();
        setActiveIndex(firstEnabledIndex());
        break;
      case "End":
        if (!isOpen) return;
        event.preventDefault();
        setActiveIndex(
          Math.max(
            options.findLastIndex((option) => !option.disabled),
            0,
          ),
        );
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && options[activeIndex]) {
          selectOption(options[activeIndex]);
        } else {
          openListbox();
        }
        break;
      case "Escape":
        if (!isOpen) return;
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      <button
        id={id}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-autocomplete="none"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen ? `${listboxId}-option-${activeIndex}` : undefined
        }
        onClick={() => (isOpen ? setIsOpen(false) : openListbox())}
        onKeyDown={handleKeyDown}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-surface px-4 text-left text-[0.9375rem] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen
            ? "border-brand ring-3 ring-brand/12"
            : "border-border hover:border-muted/45 focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/12"
        }`}
      >
        <span className={selectedOption ? "truncate text-ink" : "text-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`size-4.5 shrink-0 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-[0_18px_48px_rgba(13,29,21,0.16)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onPointerMove={() => {
                  if (!option.disabled) setActiveIndex(index);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  option.disabled
                    ? "cursor-not-allowed text-muted/50"
                    : isActive
                      ? "cursor-pointer bg-brand/8 text-ink"
                      : "cursor-pointer text-ink hover:bg-canvas"
                }`}
              >
                <span>{option.label}</span>
                <Check
                  className={`size-4 text-brand-strong ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
