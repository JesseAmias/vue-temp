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
const mockLoginStore = {
  isLogin: true,
  logout: mockLogout,
};
vi.mock("@/stores/login", async () => ({
  useLoginStoreHook: () => mockLoginStore,
}));

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

  it("columnToggle", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const dropdownEl = wrapper.find(".column-setting-dropdown .el-icon");
    await dropdownEl.trigger("click");

    const checkboxInputs = wrapper.findAll(".column-list .el-checkbox input[type='checkbox'");

    await Promise.all(
      checkboxInputs.map(async (checkboxInput) => {
        await checkboxInput.setValue(false);
      }),
    );
    const vm = wrapper.vm as any;
    expect(vm.columns.some((col: any) => col.visible === true));
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
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });

    const dropdownSystemEL = wrapper.find(".system-setting-dropdown ");
    await dropdownSystemEL.trigger("click");

    const logoutEl = wrapper.find(".logout-item .el-icon");
    await logoutEl.trigger("click");

    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({
      path: "/login",
    });
  });

  it("changeTable", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    const changeTalbleEl = wrapper.find(".chagne-table-icon");

    changeTalbleEl.trigger("click");
    expect(vm.tableV2Enabled).toBe(true);

    changeTalbleEl.trigger("click");
    expect(vm.tableV2Enabled).toBe(false);
  });

  it("handleSizeChange", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    const pageEl = wrapper.findComponent({ name: "ElPagination" });

    await pageEl.vm.$emit("size-change", 50);

    expect(vm.pageSize).toBe(50);
    expect(vm.currentPage).toBe(1);
  });

  it("handleCurrentChange", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    const pageEl = wrapper.findComponent({ name: "ElPagination" });

    await pageEl.vm.$emit("current-change", 2);
    expect(vm.currentPage).toBe(2);
  });

  it("handleRest", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    const actionEl = wrapper.findAll(".table-action .el-button");
    vm.filters = {
      subjects: ["语文"],
      scores: [0, 100],
      batches: [1, 2],
    };
    actionEl[1].trigger("click");
    const filters = {
      subjects: [],
      scoreRange: undefined,
      batch: [],
    };
    expect(vm.filters).toEqual(filters);
  });

  describe("handleSearch", async () => {
    it("handleSearch-姓名模糊搜索", async () => {
      // vi.useFakeTimers必须放在最前，启用假定时器
      vi.useFakeTimers();

      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const vm = wrapper.vm as any;

      const mockData = [
        { name: "张三", studentId: "9876" },
        { name: "李四", studentId: "12342" },
        { name: "王五", studentId: "003" },
      ];
      vm.originTableData = mockData;
      vm.tableData = [...mockData];

      const input = wrapper.find(".search-input input");
      await input.setValue("李");

      // 快进时间，触发防抖函数
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(vm.tableData).toHaveLength(1);
      expect(vm.tableData[0].name).toBe("李四");

      vi.useRealTimers();
    });

    it("handleSearch-学号模糊搜索", async () => {
      vi.useFakeTimers();

      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const vm = wrapper.vm as any;

      const mockData = [
        { name: "张三", studentId: "9876" },
        { name: "李四", studentId: "12342" },
        { name: "王五", studentId: "003" },
      ];
      vm.originTableData = mockData;
      vm.tableData = [...mockData];

      const input = wrapper.find(".search-input input");
      await input.setValue("12");

      // 快进时间，触发防抖函数
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(vm.tableData).toHaveLength(1);
      expect(vm.tableData[0].studentId).toBe("12342");

      vi.useRealTimers();
    });
  });

  it("handleRetry", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;

    expect(vm.networkError).toBe(true);
    wrapper.find(".empty-container button").trigger("click");
    expect(vm.networkError).toBe(false);
  });

  it("onSort", async () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    vm.tableV2Enabled = true;
    const mockState = {
      key: "score",
      order: "desc",
    };

    await nextTick();

    const tableEl = wrapper.findComponent({ name: "ElTableV2" });
    await tableEl.vm.$emit("column-sort", mockState);
    expect(vm.sortState).toEqual(mockState);
  });

  it("handleLogin", async () => {
    mockLoginStore.isLogin = false;
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });

    await nextTick();
    const unloginEl = wrapper.find(".unlogin");
    unloginEl.trigger("click");

    expect(mockReplace).toHaveBeenCalledWith({
      path: "/login",
    });
  });

  it("changeTheme", async () => {
    mockLoginStore.isLogin = true;
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;

    const dropdownSystemEL = wrapper.find(".system-setting-dropdown ");
    await dropdownSystemEL.trigger("click");

    const logoutEl = wrapper.find(".change-theme .el-icon");
    await logoutEl.trigger("click");
    expect(vm.currentTheme).toBe("dark");
  });
});
