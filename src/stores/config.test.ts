import { setActivePinia, createPinia } from "pinia";
import { useConfigStore, useConfigStoreHook } from "@/stores/config";
import { describe, expect, it, beforeEach, vi } from "vitest";

describe("useConfigStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("获取自定义配置数据", async () => {
    const mockData = { theme: "dark" };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      } as Response),
    );

    const store = useConfigStore();
    const result = await store.fetchConfig();
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual({ theme: "dark" });
  });
});

describe("useConfigStoreHook", () => {
  it("返回一个配置实例", async () => {
    const store = useConfigStoreHook();
    expect(store).toBeDefined();
  });
});
