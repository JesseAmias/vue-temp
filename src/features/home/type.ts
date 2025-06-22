export interface LoginCredentials {
  username: string;
  password: string;
  captchaToken: string; // 添加滑动校验的令牌
}
