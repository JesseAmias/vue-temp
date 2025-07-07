import { describe, it, expect } from "vitest";

import { getOptionLabel, getOptionValue, getOptionKey, isOptionSelected, getDisplayTextClass, getFilterOptions, getDisplayText, getSelectAllValues } from "./useDropdownLogic";
import type { DropdownOption } from "../../types/customDropdown";

describe("useDropdownLogic", () => {
  const option = { label: "Option A", value: 1 };

  it("getOptionLabel", () => {
    expect(getOptionLabel(option)).toBe("Option A");
  });

  it("getOptionValue", () => {
    expect(getOptionValue(option)).toBe(1);
  });

  it("getOptionKey", () => {
    expect(getOptionKey(option)).toBe("1_Option A");
  });

  it("isOptionSelected", () => {
    expect(isOptionSelected([1, 2], option)).toBe(true);
    expect(isOptionSelected([2, 3], option)).toBe(false);
  });

  it("getDisplayTextClass", () => {
    expect(getDisplayTextClass([])).toBe("text-gray-400");
    expect(getDisplayTextClass([1])).toBe("text-gray-900");
  });

  it("getFilterOptions by keyword", () => {
    const options: DropdownOption[] = [
      { label: "Apple", value: 1, searchable: true },
      { label: "Banana", value: 2, searchable: true },
    ];
    expect(getFilterOptions(options, true, "a")).toHaveLength(2);
    expect(getFilterOptions(options, true, "ban")).toEqual([{ label: "Banana", value: 2, searchable: true }]);
  });

  it("getDisplayText", () => {
    const options: DropdownOption[] = [
      { label: "Apple", value: 1, searchable: true },
      { label: "Banana", value: 2, searchable: true },
    ];
    const selectedValues1 = [1];
    const selectedValues2 = [1, 2];

    expect(getDisplayText(selectedValues1, options, true, 1)).toEqual(["Apple"]);
    expect(getDisplayText(selectedValues2, options, true, 1)).toEqual(["Apple", "Banana"]);
    expect(getDisplayText(selectedValues1, options, true, 1)).toEqual(["Apple"]);
  });

  it("getSelectAllValues", () => {
    const filteredOptions: DropdownOption[] = [
      { label: "Apple", value: 1, searchable: true },
      { label: "Banana", value: 2, searchable: true },
    ];
    expect(getSelectAllValues(true, filteredOptions, [1])).toEqual([1, 2]);
    expect(getSelectAllValues(false, filteredOptions, [1])).toEqual([]);
    expect(getSelectAllValues(false, filteredOptions, [1, 2])).toEqual([]);
    expect(getSelectAllValues(false, filteredOptions, [1, 2, 3])).toEqual([3]);
  });
});
