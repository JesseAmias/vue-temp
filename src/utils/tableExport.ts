import * as XLSX from "xlsx";
import FileSaver from "file-saver";

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  headers?: Record<string, string>; // 字段重命名映射
}

/**
 * 通用导出函数 - 支持 Excel 和 CSV
 * @param data 要导出的数据数组
 * @param format 导出格式 'xlsx' | 'csv'
 * @param options 导出选项
 */

export const exportTableData = <T extends Record<string, any>>(data: T[], format: "xlsx" | "csv" = "xlsx", options: ExportOptions = {}): void => {
  if (!data || data.length === 0) {
    throw new Error("导出数据不能为空");
  }

  const { filename = `导出表格_${new Date().toISOString().split("T")[0]}`, sheetName = "Sheet1", headers = {} } = options;

  try {
    // 处理表头---重命名
    let exportData: Record<string, any>[] = data;
    if (Object.keys(headers).length > 0) {
      exportData = data.map((item) => {
        const newItem: Record<string, any> = {};
        Object.keys(item).forEach((key) => {
          const newKey = headers[key] || key;
          newItem[newKey] = item[key];
        });
        return newItem;
      });
    }

    /// 将JSON数据转换为工作表
    const ws = XLSX.utils.json_to_sheet(exportData);

    if (format === "xlsx") {
      // Excel 导出
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(
        new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${filename}.xlsx`,
      );
    } else {
      // CSV 导出
      const csvString = XLSX.utils.sheet_to_csv(ws);
      const BOM = "\uFEFF"; // 解决中文乱码

      FileSaver.saveAs(new Blob([BOM + csvString], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
    }
  } catch (error) {
    console.error(`${format.toUpperCase()} 导出失败:`, error);
    throw error;
  }
};

// Vue 组合式函数版本
export function useFileExport() {
  const exportToExcel = <T extends Record<string, any>>(data: T[], options?: ExportOptions) => {
    try {
      exportTableData(data, "xlsx", options);
      return { success: true, message: "Excel 导出成功" };
    } catch (error) {
      return { success: false, message: "Excel 导出失败", error };
    }
  };

  const exportToCSV = <T extends Record<string, any>>(data: T[], options?: ExportOptions) => {
    try {
      exportTableData(data, "csv", options);
      return { success: true, message: "CSV 导出成功" };
    } catch (error) {
      return { success: false, message: "CSV 导出失败", error };
    }
  };

  const exportData = <T extends Record<string, any>>(data: T[], format: "xlsx" | "csv", options?: ExportOptions) => {
    try {
      exportTableData(data, format, options);
      return { success: true, message: `${format.toUpperCase()} 导出成功` };
    } catch (error) {
      return { success: false, message: `${format.toUpperCase()} 导出失败`, error };
    }
  };

  return {
    exportToExcel,
    exportToCSV,
    exportData,
    exportTableData,
  };
}
