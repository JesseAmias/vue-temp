import { generateMockData } from "./generateMockData";
import { describe, expect, it } from "vitest";

describe("generateMockData", () => {
  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"];
  const batches = ["期中考试", "期末考试"];

  it("返回指定长度的数据", () => {
    const data = generateMockData(1, 10);
    expect(data).toHaveLength(10);
  });

  it("返回正确的数据结构", () => {
    const data = generateMockData(1, 1);
    const row = data[0];
    expect(typeof row.id).toBe("number");
    expect(typeof row.name).toBe("string");
    expect(typeof row.studentId).toBe("string");
    // expect(typeof row.subject).toBe("string")
    expect(subjects).toContain(row.subject);
    expect(typeof row.score).toBe("number");
    // expect(typeof row.examBatch).toBe("string")
    expect(batches).toContain(row.examBatch);
  });

  it("分页生成递增的Id", () => {
    const data1 = generateMockData(1, 5);
    const data2 = generateMockData(2, 5);
    expect(data1[0].id).toBeLessThan(data2[0].id);
  });
});
