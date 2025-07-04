export interface LoginCredentials {
  username: string;
  password: string;
  captchaToken: string; // 添加滑动校验的令牌
}

export type SelectedOptions = DropdownOption | DropdownOption[];
export interface ErrorType {
  code: string;
  msg: string;
  errorCodeHigherLevel: string;
  errorMsgHigherLevel: string;
  originErrorCode: string;
  originErrorMsg: string;
  appVersion: string;
}

export interface TableRow {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
}

export interface ColumnConfig {
  key: keyof TableRow;
  dataKey: keyof TableRow;
  label: string;
  width: number;
  visible: boolean;
  sortable: boolean;
}

export enum ExportType {
  XLSX = "xlsx",
  CSV = "csv",
}
