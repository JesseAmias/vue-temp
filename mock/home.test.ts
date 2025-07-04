import { describe, it, expect, vi } from "vitest";
import stuentsInfoMock from "./home";
import * as utils from "@/utils/generateMockData";
import { errorStudentInfo } from "./home";

interface TableRow {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
}

const studentsInfoApi = stuentsInfoMock.find((item) => item.url === "/api/studentsInfo");
const errorStudentInfoApi = errorStudentInfo.find((item) => item.url === "/api/studentsInfoError");

const body = { currentPage: 1, pageSize: 10 };
const mockData: TableRow[] = [
  {
    id: 1,
    name: "张三",
    studentId: "202510001",
    subject: "数学",
    score: 88,
    examBatch: "期中考试",
  },
];

// describe("studentsInfo 接口测试", () => {
//   it("未携带token", () => {
//     const result = studentsInfoApi?.response({ body });
//     expect(result).toEqual({
//       code: 401,
//       message: "未携带 token",
//     });
//   });

//   it("token无效", () => {
//     const result = studentsInfoApi?.response({ body, headers: { Authorization: "123" } });
//     expect(result).toEqual({
//       code: 403,
//       message: "token 无效",
//     });
//   });

//   it("成功获取学生数据", () => {
//     const spy = vi.spyOn(utils, "generateMockData").mockReturnValue(mockData);
//     const result = studentsInfoApi?.response({ body, headers: { Authorization: "Bearer mock-token-123" } });
//     expect(result).toEqual({
//       code: 200,
//       message: "success",
//       data: mockData,
//     });
//     spy.mockRestore();
//   });
// });
describe("studentsInfo 接口测试", () => {
  const cases = [
    {
      name: "未携带token",
      headers: undefined,
      expected: {
        code: 401,
        message: "未携带 token",
      },
    },
    {
      name: "token无效",
      headers: { Authorization: "123" },
      expected: {
        code: 403,
        message: "token 无效",
      },
    },
    {
      name: "成功获取学生数据",
      headers: { Authorization: "Bearer mock-token-123" },
      expected: {
        code: 200,
        message: "success",
        data: mockData,
      },
      mock: true,
    },
  ];

  it.each(cases)("$name", ({ headers, expected, mock }) => {
    if (mock) {
      const spy = vi.spyOn(utils, "generateMockData").mockReturnValue(mockData);
      const result = studentsInfoApi?.response({ body, headers });
      expect(result).toEqual(expected);
      spy.mockRestore();
    } else {
      const result = studentsInfoApi?.response({ body, headers });
      expect(result).toEqual(expected);
    }
  });
});

describe("studentsInfoError", () => {
  it("获取学生数据失败", () => {
    const result = errorStudentInfoApi?.response();
    expect(result).toEqual({
      code: 500,
      message: "Internal Server Error",
    });
  });
});
