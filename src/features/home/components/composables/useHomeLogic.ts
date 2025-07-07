import type { TableRow, Filters } from "../../types/home";
import type { SortBy } from "element-plus";

export function getFilterData(originTableData: TableRow[], filters: Filters) {
  return originTableData.filter((row) => {
    // 科目筛选
    if (filters.subjects.length && !filters.subjects.includes(row.subject)) return false;

    // 分数段筛选
    if (filters.scoreRange) {
      const [min, max] = filters.scoreRange.split("-").map(Number);
      if (row.score < min || row.score > max) return false;
    }

    // 批次筛选
    if (filters.batch.length && !filters.batch.includes(row.examBatch)) return false;

    return true;
  });
}

export function getSortedTableData(tableData: TableRow[], sortState: SortBy) {
  if (!sortState.key || !sortState.order) {
    return tableData;
  }
  const data = [...tableData];
  const { key, order } = sortState;

  return data.sort((itemA: TableRow, itemB: TableRow) => {
    const valueA = itemA[key as keyof TableRow];
    const valueB = itemB[key as keyof TableRow];

    // 处理 null/undefined 值
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;

    // 数字类型排序
    if (typeof valueA === "number" && typeof valueB === "number") {
      return order === "asc" ? valueA - valueB : valueB - valueA;
    }

    // 字符串类型排序
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();

    return order === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });
}
