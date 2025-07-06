import { describe, it, expect, vi } from "vitest";
import { exportTableData, useFileExport } from "./tableExport";

import * as XLSX from "xlsx";
import FileSaver from "file-saver";

vi.mock("file-saver", () => ({
  default: {
    saveAs: vi.fn(),
  },
}));

vi.mock("xlsx", async () => {
  const actual = await vi.importActual<typeof import("xlsx")>("xlsx");
  return {
    ...actual,
    writeFile: vi.fn(),
    write: vi.fn(),
    utils: {
      ...actual.utils,
      json_to_sheet: vi.fn(),
      sheet_to_csv: vi.fn(),
      book_new: vi.fn(),
      book_append_sheet: vi.fn(),
    },
  };
});

describe("exportTableData", () => {
  const testData = [
    { name: "Alice", age: 18 },
    { name: "Bob", age: 20 },
  ];

  it("成功导出xlsx文件", () => {
    exportTableData(testData, "xlsx");
    expect(FileSaver.saveAs).toHaveBeenCalled();
  });

  it("成功导出csv文件", () => {
    exportTableData(testData, "csv");
    expect(FileSaver.saveAs).toHaveBeenCalled();
  });

  it("空数据导出失败", () => {
    expect(() => exportTableData([], "xlsx")).toThrow("导出数据不能为空");
  });

  it("自定义表头映射", () => {
    exportTableData(testData, "xlsx", { headers: { name: "姓名", age: "年龄" } });
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      { 姓名: "Alice", 年龄: 18 },
      { 姓名: "Bob", 年龄: 20 },
    ]);
  });
});

describe("useFileExport", () => {
  const testData = [
    { name: "Alice", age: 18 },
    { name: "Bob", age: 20 },
  ];
  it("成功导出xlsx文件", () => {
    const { exportToExcel } = useFileExport();
    const result = exportToExcel(testData);
    expect(FileSaver.saveAs).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toBe("Excel 导出成功");
  });

  it("成功导出csv文件", () => {
    const { exportToCSV } = useFileExport();
    const result = exportToCSV(testData);
    expect(FileSaver.saveAs).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toBe("CSV 导出成功");
  });

  it("调用 exportData 成功", () => {
    const { exportData } = useFileExport();
    const result = exportData(testData, "xlsx");
    expect(FileSaver.saveAs).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.message).toBe("XLSX 导出成功");
  });

  it("自定义表头映射", () => {
    const { exportData } = useFileExport();
    const headers = { name: "姓名", age: "年龄" };
    const result = exportData(testData, "xlsx", { headers });
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
      { 姓名: "Alice", 年龄: 18 },
      { 姓名: "Bob", 年龄: 20 },
    ]);
    expect(result.success).toBe(true);
    expect(result.message).toBe("XLSX 导出成功");
  });

  it("导出空数组返回失败", () => {
    const { exportToExcel } = useFileExport();
    const resutl = exportToExcel([]);
    expect(resutl.success).toBe(false);
    expect(resutl.message).toBe("Excel 导出失败");
    expect(resutl.error).toBeDefined();
  });

  it("CSV导出失败返回失败", () => {
    const saveAsSpy = vi.spyOn(FileSaver, "saveAs").mockImplementation(() => {
      throw new Error("保存失败");
    });
    const { exportToCSV } = useFileExport();
    const result = exportToCSV([]);
    expect(result.success).toBe(false);
    expect(result.message).toBe("CSV 导出失败");
    saveAsSpy.mockRestore();
  });

  it("XLSX导出失败返回失败", () => {
    // 临时禁用 console.error
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const saveAsSpy = vi.spyOn(FileSaver, "saveAs").mockImplementation(() => {
      throw new Error("保存失败");
    });
    const { exportData } = useFileExport();
    const xlsxResult = exportData(testData, "xlsx");
    expect(xlsxResult.success).toBe(false);
    expect(xlsxResult.message).toBe("XLSX 导出失败");

    saveAsSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
