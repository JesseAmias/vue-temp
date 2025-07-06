import { describe, it, expect } from "vitest";

import { getOptionLabel, getOptionValue, getOptionKey, isOptionSelected, getDisplayTextClass, filterOptions } from "./useDropdownLogic";
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

  it("filterOptions by keyword", () => {
    const options: DropdownOption[] = [
      { label: "Apple", value: 1 },
      { label: "Banana", value: 2 },
    ];
    expect(filterOptions(options, "a")).toHaveLength(2);
    expect(filterOptions(options, "ban")).toEqual([{ label: "Banana", value: 2 }]);
  });
});
