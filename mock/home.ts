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
  const subjects = ["语文", "数学", "英语", "物理", "化学"];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function getRandomBatch() {
  const batches = ["第一批", "第二批", "第三批"];
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
    response: ({ body }: { body: { currentPage: number; pageSize: number } }) => {
      const { currentPage = 1, pageSize = 10 } = body;
      const data = generateMockData(currentPage, pageSize);
      return {
        code: 200,
        message: "success",
        data,
      };
    },
  },
] as MockMethod[];
