import type { DropdownOption } from "../../types/customDropdown";

export function getOptionLabel(option: DropdownOption, labelKey = "label"): string {
  return option[labelKey] || option.label || String(option);
}

export function getOptionValue(option: DropdownOption, valueKey = "value"): any {
  if (!option) return undefined;
  return option[valueKey] !== undefined ? option[valueKey] : option.value;
}

export function getOptionKey(option: DropdownOption, labelKey = "label", valueKey = "value"): string {
  return `${getOptionValue(option, valueKey)}_${getOptionLabel(option, labelKey)}`;
}

export function isOptionSelected(selectedValues: any[], option: DropdownOption, valueKey = "value"): boolean {
  return selectedValues.includes(getOptionValue(option, valueKey));
}

export function getDisplayTextClass(selectedValues: any[]): string {
  return selectedValues.length === 0 ? "text-gray-400" : "text-gray-900";
}

export function filterOptions(options: DropdownOption[], keyword: string, labelKey = "label") {
  return options.filter((opt) => getOptionLabel(opt, labelKey).toLowerCase().includes(keyword.toLowerCase()));
}
