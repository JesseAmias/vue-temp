// 定义主题类型
type ThemeType = "light" | "dark";
// 定义组件属性
export interface Props {
  // 基础配置
  modelValue?: any;
  options: DropdownOption[];
  placeholder?: string;
  isOpen?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  width?: string;

  // 选择模式
  multiple?: boolean;
  showSelectAll?: boolean;

  // 搜索功能
  searchable?: boolean;
  searchPlaceholder?: string;

  // 自定义字段映射
  labelKey?: string;
  valueKey?: string;

  // 选项无数据时显示文本
  noDataText?: string;

  // 筛选类型
  filterType?: "subject" | "score" | "batch" | "custom";

  // 主题配置
  theme?: ThemeType;
}

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
  [key: string]: any;
}
