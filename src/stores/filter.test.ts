import { describe, expect, it, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useStudentsFilter, useStudentsFilterStore } from "./filter";

describe("useStudentsFilter", () => {
  const key = "filters";
  const initVal = {
    subjects: ["语文"],
    scoreRange: "50-60",
    batch: ["期中考试"],
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    sessionStorage.clear();
  });

  it("初始化filter", () => {
    const store = useStudentsFilter();
    expect(store.filters).toBeDefined();
    expect(store.filters.subjects).toEqual([]);
  });

  it("sessionStorage的初始值来初始化", () => {
    sessionStorage.setItem(key, JSON.stringify(initVal));
    const store = useStudentsFilter();
    expect(store.filters).toEqual(initVal);
  });

  it("修改filter时同时修改sessionStorage", async () => {
    const store = useStudentsFilter();
    store.filters.subjects = ["数学"];

    await nextTick();

    const storedVal = JSON.parse(sessionStorage.getItem(key)!);
    expect(storedVal.subjects).toContain("数学");
  });
});

describe("useStudentsFilterStore", () => {
  it("返回一个filter实例", () => {
    const store = useStudentsFilterStore();
    expect(store).toBeDefined();
  });
});
