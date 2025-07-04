import { setupStore } from "./index";
import { describe, expect, vi, it } from "vitest";

describe("setupStore", () => {
  it("setupStore", () => {
    const app = {
      use: vi.fn(),
    } as any;
    setupStore(app);
    expect(app.use).toHaveBeenCalled();
  });
});
