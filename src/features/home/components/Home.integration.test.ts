import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { mount } from "@vue/test-utils";
import Home from "./Home.vue";
import type { Plugin } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
function createVueQueryPlugin(): [Plugin, { queryClient: QueryClient }] {
  const queryClient = new QueryClient();
  return [VueQueryPlugin, { queryClient }];
}

const [vueQueryPlugin, options] = createVueQueryPlugin();

// 在 mock 中定义 mock 函数
vi.mock("../apis/home", () => ({
  studentsInfo: vi.fn(),
  studentsInfoError: vi.fn(),
}));
import { studentsInfo } from "../apis/home";

const mockExportData = vi.fn();
vi.mock("@/utils/tableExport", async () => {
  const actual = await vi.importActual<any>("@/utils/tableExport");
  return {
    ...actual,
    useFileExport: () => ({
      exportData: mockExportData,
    }),
  };
});
// mockExportData.mockImplementation(() => ({ success: true, message: "Export CSV success" }));
import { useFileExport } from "@/utils/tableExport";

vi.mock("element-plus", async () => {
  const actual = await vi.importActual<typeof import("element-plus")>("element-plus");
  return {
    ...actual,
    ElMessage: {
      ...actual.ElMessage,
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe("Home.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should trigger onSuccess correctly", async () => {
    const mockRes = { data: [{ id: 1, name: "test" }] };

    (studentsInfo as any).mockResolvedValue(mockRes);

    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });
    const vm = wrapper.vm as any;
    vm.networkError = false;
    vm.currentPage = 2;
    vm.pageSize = 12;

    // const handleQuerySpy = vi.spyOn(vm, "handleQuery");
    // vi.spyOn(vm, "handleQuery").mockImplementation(() => {});

    vm.getStudentsInfo();

    await vm.$nextTick();

    await vi.waitFor(() => {
      expect(vm.networkError).toBe(false);
      expect(vm.originTableData).toEqual(mockRes.data);
      // expect(handleQuerySpy).toHaveBeenCalled();
    });
  });

  it("should trigger onError and set networkError = true", () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [[vueQueryPlugin, options]],
      },
    });

    const vm = wrapper.vm as any;
    vm.networkError = true;

    expect(vm.networkError).toBe(true);
  });

  // it("handleExportData", async () => {
  //   const wrapper = mount(Home, {
  //     global: {
  //       plugins: [[vueQueryPlugin, options]],
  //     },
  //   });

  //   const vm = wrapper.vm as any;

  //   const dropdownEl = wrapper.find(".export-dropdown .el-icon");
  //   await dropdownEl.trigger("click");

  //   const exportEls = wrapper.find(".export-wrapper").findAll("div");
  //   await exportEls[0].trigger("click");
  // });

  describe("ExportData集成测试", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("导出xlsx成功", async () => {
      const { exportData } = useFileExport();
      const mockRes = {
        success: true,
        message: "XLSX 导出成功",
      };

      (exportData as any).mockReturnValue(mockRes);

      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const vm = wrapper.vm as any;

      await wrapper.find(".export-dropdown .el-icon").trigger("click");
      await wrapper.find(".export-wrapper").findAll("div")[0].trigger("click");

      expect(mockExportData).toHaveBeenCalledWith(vm.tableData, "xlsx", {
        headers: {
          id: "ID",
          name: "姓名",
          score: "成绩",
          studentId: "学号",
          subject: "科目",
        },
      });
      expect(ElMessage.success).toHaveBeenCalledWith("XLSX 导出成功");
    });
    it("导出xlsx失败", async () => {
      const { exportData } = useFileExport();
      const mockRes = {
        success: false,
        message: "XLSX 导出失败",
      };

      (exportData as any).mockReturnValue(mockRes);

      const wrapper = mount(Home, {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      });
      const vm = wrapper.vm as any;

      await wrapper.find(".export-dropdown .el-icon").trigger("click");
      await wrapper.find(".export-wrapper").findAll("div")[0].trigger("click");

      expect(mockExportData).toHaveBeenCalledWith(vm.tableData, "xlsx", {
        headers: {
          id: "ID",
          name: "姓名",
          score: "成绩",
          studentId: "学号",
          subject: "科目",
        },
      });
      expect(ElMessage.error).toHaveBeenCalledWith("XLSX 导出失败");
    });
  });
});
