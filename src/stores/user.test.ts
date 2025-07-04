import { describe, expect, it, vi, beforeEach } from "vitest";
import { setActivePinia } from "pinia";
import { createTestingPinia } from "@pinia/testing";
import { useUserStore, useUserStoreHook } from "./user";

const mockLoginStore = {
  isLogin: true,
  rememberMe: true,
  setRememberMe: vi.fn(),
  removeRememberMe: vi.fn(),
};

vi.mock("./login", () => ({
  useLoginStoreHook: () => mockLoginStore,
}));

describe("useUserStore", () => {
  let userStore: ReturnType<typeof useUserStore>;
  beforeEach(() => {
    setActivePinia(createTestingPinia({ createSpy: vi.fn, stubActions: false }));
    userStore = useUserStore();
    localStorage.clear();
  });

  it("登录且记住密码保存用户数据", () => {
    userStore.setUserInfo("testUser", "testPass");

    const encryptedUsername = localStorage.getItem("username");
    const encryptedPassword = localStorage.getItem("password");

    expect(encryptedUsername).toBeTruthy();
    expect(encryptedPassword).toBeTruthy();
  });

  it("获取解密后的用户数据", () => {
    userStore.setUserInfo("testUser", "testPass");
    userStore.getUserInfo();
    expect(userStore.userInfo.username).toBe("testUser");
  });

  it("清除用户数据", () => {
    userStore.setUserInfo("testUser", "testPass");

    mockLoginStore.rememberMe = false;
    userStore.clearUserInfo();

    expect(userStore.userInfo.username).toBe("");
    expect(userStore.userInfo.password).toBe("");

    expect(localStorage.getItem("username")).toBeNull();
    expect(localStorage.getItem("password")).toBeNull();
  });

  it("登录不勾选记住密码不保存用户数据", () => {
    mockLoginStore.rememberMe = false;
    userStore.setUserInfo("testUser", "testPass");

    const encryptedUsername = localStorage.getItem("username");
    const encryptedPassword = localStorage.getItem("password");

    expect(encryptedUsername).toBeNull();
    expect(encryptedPassword).toBeNull();
  });
});

describe("useUserStoreHook", () => {
  it("返回 useUserStore", () => {
    const userStore = useUserStoreHook();
    expect(userStore).toBeDefined();
  });
});
