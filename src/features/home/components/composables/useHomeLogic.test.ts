import { describe, it, expect } from "vitest";
import { getFilterData, getSortedTableData } from "./useHomeLogic";
import type { TableRow, Filters } from "../../types/home";
import type { SortBy } from "element-plus";
import { TableV2SortOrder } from "element-plus";

const mockTableData: TableRow[] = [
  { id: 1, name: "张三", studentId: "001", subject: "数学", score: 85, examBatch: "第一批" },
  { id: 2, name: "李四", studentId: "002", subject: "语文", score: 92, examBatch: "第二批" },
  { id: 3, name: "王五", studentId: "003", subject: "英语", score: 78, examBatch: "第一批" },
  { id: 4, name: "赵六", studentId: "004", subject: "数学", score: 95, examBatch: "第三批" },
  { id: 5, name: "钱七", studentId: "005", subject: "语文", score: 65, examBatch: "第二批" },
  { id: 6, name: "孙八", studentId: "006", subject: "英语", score: 88, examBatch: "第一批" },
];

describe("useHomeLogic", () => {
  it("应该返回所有数据当没有任何过滤条件时", () => {
    const filters: Filters = {
      subjects: [],
      scoreRange: undefined,
      batch: [],
    };

    const result = getFilterData(mockTableData, filters);
    expect(result).toEqual(mockTableData);
    expect(result).toHaveLength(6);
  });

  describe("科目筛选", () => {
    it("应该按单个科目筛选", () => {
      const filters: Filters = {
        subjects: ["数学"],
        scoreRange: undefined,
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((row) => row.subject === "数学")).toBe(true);
    });

    it("应该按多个科目筛选", () => {
      const filters: Filters = {
        subjects: ["数学", "语文"],
        scoreRange: undefined,
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(4);
      expect(result.every((row) => ["数学", "语文"].includes(row.subject))).toBe(true);
    });

    it("应该返回空数组当科目不存在时", () => {
      const filters: Filters = {
        subjects: ["物理"],
        scoreRange: undefined,
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe("分数段筛选", () => {
    it("应该按分数段筛选", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: "80-90",
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((row) => row.score >= 80 && row.score <= 90)).toBe(true);
    });

    // it("应该正确处理边界值", () => {
    //   const filters: Filters = {
    //     subjects: [],
    //     scoreRange: "85-95",
    //     batch: [],
    //   };

    //   const result = getFilterData(mockTableData, filters);
    //   expect(result).toHaveLength(3);
    //   expect(result.map((row) => row.score)).toEqual([85, 92, 95]);
    // });

    it("应该处理单个分数值", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: "85-85",
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(85);
    });

    it("应该返回空数组当分数段无匹配时", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: "100-110",
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe("批次筛选", () => {
    it("应该按单个批次筛选", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: undefined,
        batch: ["第一批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(3);
      expect(result.every((row) => row.examBatch === "第一批")).toBe(true);
    });

    it("应该按多个批次筛选", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: undefined,
        batch: ["第一批", "第二批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(5);
      expect(result.every((row) => ["第一批", "第二批"].includes(row.examBatch))).toBe(true);
    });

    it("应该返回空数组当批次不存在时", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: undefined,
        batch: ["第四批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe("多条件组合筛选", () => {
    it("应该同时按科目和分数段筛选", () => {
      const filters: Filters = {
        subjects: ["数学"],
        scoreRange: "80-90",
        batch: [],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe("数学");
      expect(result[0].score).toBe(85);
    });

    it("应该同时按科目和批次筛选", () => {
      const filters: Filters = {
        subjects: ["语文"],
        scoreRange: undefined,
        batch: ["第二批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((row) => row.subject === "语文" && row.examBatch === "第二批")).toBe(true);
    });

    it("应该同时按分数段和批次筛选", () => {
      const filters: Filters = {
        subjects: [],
        scoreRange: "80-95",
        batch: ["第一批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(2);
      expect(result.every((row) => row.score >= 80 && row.score <= 95 && row.examBatch === "第一批")).toBe(true);
    });

    it("应该同时按所有条件筛选", () => {
      const filters: Filters = {
        subjects: ["英语"],
        scoreRange: "80-90",
        batch: ["第一批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe("英语");
      expect(result[0].score).toBe(88);
      expect(result[0].examBatch).toBe("第一批");
    });

    it("应该返回空数组当多条件无匹配时", () => {
      const filters: Filters = {
        subjects: ["数学"],
        scoreRange: "60-70",
        batch: ["第一批"],
      };

      const result = getFilterData(mockTableData, filters);
      expect(result).toHaveLength(0);
    });
  });
});

describe("getSortedTableData", () => {
  describe("基础功能测试", () => {
    it("应该返回原数组当 key 为空时", () => {
      const sortState: SortBy = { key: "", order: TableV2SortOrder.ASC };
      const result = getSortedTableData(mockTableData, sortState);

      expect(result).toEqual(mockTableData);
    });

    it("应该不修改原数组", () => {
      const originalData = [...mockTableData];
      const sortState: SortBy = { key: "id", order: TableV2SortOrder.ASC };

      getSortedTableData(mockTableData, sortState);

      expect(mockTableData).toEqual(originalData);
    });
  });

  describe("字符串类型排序", () => {
    it("应该按 name 升序排序", () => {
      const sortState: SortBy = { key: "name", order: TableV2SortOrder.ASC };
      const result = getSortedTableData(mockTableData, sortState);

      expect(result.map((item) => item.name)).toEqual(["李四", "钱七", "孙八", "王五", "张三", "赵六"]);
    });

    it("应该按 studentId 升序排序", () => {
      const sortState: SortBy = { key: "studentId", order: TableV2SortOrder.ASC };
      const result = getSortedTableData(mockTableData, sortState);

      expect(result.map((item) => item.studentId)).toEqual(["001", "002", "003", "004", "005", "006"]);
    });
  });
});
