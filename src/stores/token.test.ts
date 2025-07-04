import { describe, expect, it, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTokenStore, useTokenStoreHook } from "@/stores/token";

describe("useTokenStoreHook", () => {
  it("返回一个token实例", () => {
    const store = useTokenStoreHook();
    expect(store).toBeDefined();
  });
});

describe("useTokenStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("初始化时，token为空", () => {
    const store = useTokenStore();
    expect(store.token).toBe("");
  });

  it("设置token", () => {
    const store = useTokenStore();
    store.setToken("test-token");
    expect(store.token).toBe("test-token");
  });

  it("清除token", () => {
    const store = useTokenStore();
    store.setToken("test-token");
    store.clearToken();
    expect(store.token).toBe("");
  });
});
