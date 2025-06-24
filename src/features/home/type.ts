export interface LoginCredentials {
  username: string;
  password: string;
  captchaToken: string; // 添加滑动校验的令牌
}

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
  [key: string]: any;
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
