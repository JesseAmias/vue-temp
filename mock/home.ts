import type { MockMethod } from "vite-plugin-mock";
import { generateMockData } from "../src/utils/generateMockData";

export default [
  {
    url: "/api/studentsInfo",
    method: "post",
    response: ({ body, headers }: { body: { currentPage: number; pageSize: number }; headers: any }) => {
      const token = headers?.authorization || headers?.Authorization;

      // 模拟 token 校验
      if (!token) {
        return {
          code: 401,
          message: "未携带 token",
        };
      }

      if (token !== "Bearer mock-token-123") {
        return {
          code: 403,
          message: "token 无效",
        };
      }

      const { currentPage = 1, pageSize = 10 } = body;
      const data = generateMockData(currentPage, pageSize);
      return {
        code: 200,
        message: "success",
        data,
      };
    },
    timeout: 2000,
  },
] as MockMethod[];

export const errorStudentInfo = [
  {
    url: "/api/studentsInfoError",
    method: "post",
    statusCode: 500,
    response: () => {
      return {
        code: 500,
        message: "Internal Server Error",
      };
    },
    timeout: 2000,
  },
] as MockMethod[];
