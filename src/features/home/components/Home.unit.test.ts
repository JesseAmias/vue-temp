import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import Home from "./Home.vue";

import type { Plugin } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import * as vueQuery from "@tanstack/vue-query";
import { VueWrapper } from "@vue/test-utils";
function createVueQueryPlugin(): [Plugin, { queryClient: QueryClient }] {
  const queryClient = new QueryClient();
  return [VueQueryPlugin, { queryClient }];
}

const [vueQueryPlugin, options] = createVueQueryPlugin();

vi.mock("element-plus", async () => {
  const actual = await vi.importActual<typeof import("element-plus")>("element-plus");
  return {
    ...actual,
    ElMessage: {
      ...actual.ElMessage,
      warning: vi.fn(),
    },
  };
});

vi.mock("@tanstack/vue-query", async (importOriginal) => {
  const actual = await importOriginal<typeof vueQuery>();
  return {
    ...actual,
    useMutation: vi.fn(), // 只 mock useMutation，保留其他
  };
});

const mockLogout = vi.fn();
vi.mock("@/stores/login", async () => ({
  useLoginStoreHook: () => ({
    isLogin: true,
    logout: mockLogout,
  }),
}));
import { useLoginStoreHook } from "@/stores/login";

const mockReplace = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("Home.vue", () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (vueQuery.useMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: ref(false), // 使用 ref 包裹
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("正确渲染home页面", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    expect(wrapper.text()).toContain("教学管理系统");
  });

  it("selectAll", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const dropdownEl = wrapper.find(".column-setting-dropdown .el-icon");
    await dropdownEl.trigger("click");

    const checkboxInput = wrapper.find('.dropdown-header input[type="checkbox"]');
    await checkboxInput.setValue(true);

    const vm = wrapper.vm as any;
    expect(vm.columns.every((col: any) => col.visible)).toBe(true);
    expect(ElMessage.warning).not.toHaveBeenCalled();

    await checkboxInput.setValue(false);
    expect(ElMessage.warning).toHaveBeenCalledWith("至少需要显示一列");
  });

  it("handleFilterChange", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    const dropdownEl = wrapper.findComponent(".subject-dropdown") as VueWrapper<any>;

    await dropdownEl.vm.$emit("update:modelValue", ["语文"]);
    await dropdownEl.vm.$emit("change", ["语文"], []);

    expect(vm.filters.subjects).toEqual(["语文"]);
    expect(vm.currentPage).toBe(1);
    expect(vm.tableData).toEqual(vm.filteredData);
  });

  describe("测试getStudentsInfo", () => {
    it("getStudentsInfo", () => {
      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const vm = wrapper.vm as any;

      vm.currentPage = 2;
      vm.pageSize = 12;
      vm.getStudentsInfo();
      expect(mockMutate).toHaveBeenCalledWith({
        currentPage: 2,
        pageSize: 12,
      });
    });
  });

  describe("useMutation - mutationFn", () => {
    let capturedConfig: any;

    beforeEach(() => {
      vi.clearAllMocks();

      // 捕获 useMutation 配置项
      (vueQuery.useMutation as unknown as ReturnType<typeof vi.fn>).mockImplementation((config) => {
        capturedConfig = config;
        return {
          mutate: vi.fn(),
          isPending: ref(false),
        };
      });
    });

    it("调用studentsInfo", async () => {
      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const params = { currentPage: 1, pageSize: 10 };

      // mock 外部数据源状态
      const fakeStudentsInfo = vi.fn().mockResolvedValue({ data: ["student1"] });
      const fakeNetworkError = { value: false };

      // 替换闭包中依赖（networkError/studentsInfo）
      capturedConfig.mutationFn = async (params: any) => {
        return fakeNetworkError.value ? Promise.reject(new Error("network error")) : fakeStudentsInfo(params);
      };

      const result = await capturedConfig.mutationFn(params);

      expect(fakeStudentsInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual({ data: ["student1"] });
    });
  });

  it("handleLogout", async () => {
    const loginStore = useLoginStoreHook();
    const router = useRouter();

    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });

    const vm = wrapper.vm as any;

    const dropdownSystemEL = wrapper.find(".system-setting-dropdown ");
    await dropdownSystemEL.trigger("click");

    const logoutEl = wrapper.find(".logout-item .el-icon");
    await logoutEl.trigger("click");

    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({
      path: "/login",
    });
  });
});
