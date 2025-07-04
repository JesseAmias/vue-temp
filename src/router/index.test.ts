import { describe, it, expect, vi } from "vitest";
import router from "@/router";

vi.mock("@/stores/login", () => ({
  useLoginStoreHook: () => ({
    isLogin: false,
  }),
}));

describe("router", () => {
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
