import { describe, it, expect, beforeEach } from "vitest";

import { useLoginStore, useLoginStoreHook } from "./login";
import { setActivePinia, createPinia } from "pinia";

describe("useLoginStore", () => {
  let loginStore: ReturnType<typeof useLoginStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    loginStore = useLoginStore();
  });

  it("登录状态保存", () => {
    loginStore.patchLogin(true, true);
    expect(loginStore.rememberMe).toBe(true);
  });

  it("测试登出", () => {
    loginStore.logout();
    expect(loginStore.isLogin).toBe(false);
  });

  it("测试取消记住密码", () => {
    loginStore.setRememberMe(true);
    loginStore.removeRememberMe();
    expect(loginStore.rememberMe).toBe(false);
  });
});
