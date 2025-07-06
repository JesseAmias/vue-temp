import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import router from "@/router";

vi.mock("@/stores/login", () => ({
  useLoginStoreHook: () => ({
    isLogin: false,
  }),
}));

describe("router", () => {
  beforeEach(() => {
    // 模拟 scrollTo，防止控制台输出错误
    vi.stubGlobal("scrollTo", vi.fn());
  });
  afterEach(() => {
    // 还原所有 global stubs
    vi.unstubAllGlobals();
  });

  it("非登录状态跳转到登录页", async () => {
    await router.push("/admin");
    await router.isReady();
    expect(router.currentRoute.value.path).toBe("/login");
  });
});

describe("scrollBehavior", () => {
  const scrollBehavior = router.options.scrollBehavior!;

  it("有hash值跳转到对应的锚点", () => {
    const result = scrollBehavior({ hash: "#section" } as any, {} as any, null);
    expect(result).toEqual({
      el: "#section",
      behavior: "smooth",
    });
  });
});
