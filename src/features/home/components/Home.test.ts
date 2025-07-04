import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Home from "./Home.vue";

import type { Plugin } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";

function createVueQueryPlugin(): [Plugin, { queryClient: QueryClient }] {
  const queryClient = new QueryClient();
  return [VueQueryPlugin, { queryClient }];
}

const [vueQueryPlugin, options] = createVueQueryPlugin();

describe("Home.vue", () => {
  it("正确渲染home页面", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    expect(wrapper.text()).toContain("教学管理系统");
  });

  it("", () => {});
});
