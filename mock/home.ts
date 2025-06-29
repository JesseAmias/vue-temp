// mock/home.ts
import { MockMethod } from "vite-plugin-mock";
import { faker } from "@faker-js/faker/locale/zh_CN";
interface TableRow {
  id: number;
  name: string;
  studentId: string;
  subject: string;
  score: number;
  examBatch: string;
}

function getRandomName(): string {
  return faker.person.fullName();
}

function getRandomSubject() {
  const subjects = ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function getRandomBatch() {
  const batches = ["期中考试", "期末考试"];
  return batches[Math.floor(Math.random() * batches.length)];
}

function generateMockData(currentPage: number, pageSize: number): TableRow[] {
  const data: TableRow[] = [];
  const startId = (currentPage - 1) * pageSize + 1;
  for (let i = 0; i < pageSize; i++) {
    const id = startId + i;
    data.push({
      id,
      name: getRandomName(),
      studentId: `2025${(10000 + id).toString().slice(-5)}`,
      subject: getRandomSubject(),
      score: Math.floor(Math.random() * 41) + 40, // 40-100
      examBatch: getRandomBatch(),
    });
  }
  return data;
}

export default [
  {
    url: "/api/stuentsInfo",
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
    url: "/api/stuentsInfoError",
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
