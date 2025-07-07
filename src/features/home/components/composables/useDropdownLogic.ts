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

export function getFilterOptions(options: DropdownOption[], searchable: boolean, keyword: string, labelKey = "label"): DropdownOption[] {
  let filtered = options.filter((option) => !option.disabled) || [];
  if (searchable && keyword) {
    filtered = filtered.filter((option) => getOptionLabel(option, labelKey).toLowerCase().includes(keyword.toLowerCase()));
  }
  return filtered;
}

export function getDisplayText(selectedValues: any, options: DropdownOption[], multiple: boolean, modelValue: any, labelKey: string = "label", valueKey: string = "value"): string | string[] {
  if (selectedValues.length === 0) {
    return multiple ? [] : "";
  }
  if (multiple && Array.isArray(selectedValues)) {
    return selectedValues.map((value) => {
      const option = options.find((opt) => getOptionValue(opt, valueKey) === value);
      return option ? getOptionLabel(option, labelKey) : "";
    });
  } else {
    const option = options.find((opt) => getOptionValue(opt, valueKey) === modelValue);
    return option ? getOptionLabel(option, labelKey) : "";
  }
}

// const newValues = selectedValues.value.filter((val) => !filteredOptions.value.some((option) => getOptionValue(option) === val));

/**
 * 获取全选的值
 * @param selectedAll 是否全选
 * @param filteredOptions 已过滤的选项
 * @param selectedValues 选中的值
 * @param valueKey 值字段
 * @returns 全选的值/取消全选的值
 */
export function getSelectAllValues(selectedAll: boolean, filteredOptions: DropdownOption[], selectedValues: any[], valueKey = "value"): any[] {
  if (selectedAll) {
    // 全选
    const allValues = [...selectedValues];
    filteredOptions.forEach((option) => {
      const value = getOptionValue(option, valueKey);
      !allValues.includes(value) && allValues.push(value);
    });
    return allValues;
  } else {
    // 取消全选
    // diabledValues：取消所有在过滤选项中的值，返回禁用但已选择的值。选中的值中，没有包含在已过滤的选项中（如：某些值是disabled，保留其被选中状态）
    const diabledValues = selectedValues.filter((val) => !filteredOptions.some((option) => getOptionValue(option, valueKey) === val));
    return diabledValues;
  }
}
