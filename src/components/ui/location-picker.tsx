"use client";

import { useId, useState } from "react";

import { CountrySelect } from "@/components/ui/country-select";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  formatLocation,
  parseLocation,
  regionNamesFor,
  type LocationParts,
} from "@/lib/locations";

type PickerState = {
  /** The display string these parts came from, so external edits reset them. */
  source: string;
  parts: LocationParts;
};

/**
 * Country, region, and city for a location that is stored as one display string.
 *
 * The parent owns the string; the picker owns the three inputs while the creator
 * is typing. Keeping the parts in local state matters: if every keystroke were
 * parsed back out of "Lagos, Nigeria", typing "Lagos" into the city field would
 * be mistaken for the Lagos region and moved out from under the cursor.
 *
 * A country outside the region dataset still gets a free-text region field, and
 * the city is always free text. The country itself comes from the shared
 * CLDR/ISO list, so no component holds its own country names.
 */
export function LocationPicker({
  error,
  help,
  id,
  label,
  onChange,
  value,
}: {
  error?: string | null;
  help?: string;
  /** Base id for the three controls; one is generated when omitted. */
  id?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;

  const [state, setState] = useState<PickerState>(() => ({
    source: value,
    parts: parseLocation(value),
  }));

  // React's "adjust state when a prop changes" pattern. The picker is controlled
  // by a display string, but an external change (loading a draft, resetting a
  // form) must replace the parts rather than be parsed on every keystroke.
  if (value !== state.source) {
    setState({ source: value, parts: parseLocation(value) });
  }

  const { city, countryCode, region } = state.parts;
  const regions = regionNamesFor(countryCode);
  const hasRegionList = regions.length > 0;
  const describedBy =
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  function commit(next: LocationParts) {
    const nextValue = formatLocation(next);
    setState({ source: nextValue, parts: next });
    if (nextValue !== value) onChange(nextValue);
  }

  function changeCountry(nextCode: string) {
    const nextRegions = regionNamesFor(nextCode);
    const regionStillValid = region.length > 0 && nextRegions.includes(region);

    commit({
      city,
      countryCode: nextCode,
      region: regionStillValid ? region : "",
    });
  }

  return (
    <fieldset aria-describedby={describedBy} className="min-w-0 space-y-1.5">
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      {help ? (
        <p id={helpId} className="text-xs leading-relaxed text-muted">
          {help}
        </p>
      ) : null}

      <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor={`${baseId}-country`}
            className="block text-sm font-medium text-ink"
          >
            Country
          </label>
          <CountrySelect
            {...(describedBy ? { describedBy } : {})}
            id={`${baseId}-country`}
            invalid={Boolean(error)}
            onChange={changeCountry}
            value={countryCode}
          />
        </div>

        <div className="space-y-1.5">
          <label
            id={`${baseId}-region-label`}
            htmlFor={`${baseId}-region`}
            className="block text-sm font-medium text-ink"
          >
            Region / state
          </label>
          {hasRegionList ? (
            <Select
              aria-describedby={describedBy}
              aria-labelledby={`${baseId}-region-label`}
              id={`${baseId}-region`}
              options={[
                { label: "Not specified", value: "" },
                ...regions.map((name) => ({ label: name, value: name })),
              ]}
              placeholder="Choose a region"
              value={region}
              onValueChange={(next) =>
                commit({ city, countryCode, region: next })
              }
            />
          ) : (
            <Input
              id={`${baseId}-region`}
              aria-describedby={describedBy}
              disabled={!countryCode}
              placeholder={
                countryCode
                  ? "State, province, or region"
                  : "Choose a country first"
              }
              value={region}
              onChange={(event) =>
                commit({
                  city,
                  countryCode,
                  region: event.target.value,
                })
              }
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${baseId}-city`}
            className="block text-sm font-medium text-ink"
          >
            City <span className="font-normal text-muted">optional</span>
          </label>
          <Input
            id={`${baseId}-city`}
            aria-describedby={describedBy}
            placeholder="City or town"
            value={city}
            onChange={(event) =>
              commit({
                city: event.target.value,
                countryCode,
                region,
              })
            }
          />
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
