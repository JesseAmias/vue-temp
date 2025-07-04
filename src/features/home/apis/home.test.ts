import { describe, expect, it, vi, afterEach, afterAll } from "vitest";
import { axios } from "@/lib/axios";
import { studentsInfo, studentsInfoError } from "./home";

vi.mock("@/lib/axios", () => ({
  axios: { post: vi.fn() },
}));

describe("studentsInfo", () => {
  afterEach(() => {
    // 清理所有 mock
    vi.clearAllMocks();
  });

  // 在所有测试完成后恢复原始模块
  afterAll(() => {
    vi.restoreAllMocks();
  });
  it("测试调用正常的学生信息接口", () => {
    const mockRes = { data: { code: 0, data: { list: [] } } };
    const mockParams = { currentPage: 1, pageSize: 10 };
    vi.mocked(axios.post as any).mockReturnValueOnce(mockRes);
    studentsInfo(mockParams);
    expect(axios.post).toHaveBeenCalledWith("/api/studentsInfo", mockParams);
  });
});

describe("studentsInfoError", () => {
  afterEach(() => {
    // 清理所有 mock
    vi.clearAllMocks();
  });

  // 在所有测试完成后恢复原始模块
  afterAll(() => {
    vi.restoreAllMocks();
  });
  it("测试调用错误的学生信息接口", () => {
    const mockRes = { data: { code: 0, data: { list: [] } } };
    const mockParams = { currentPage: 1, pageSize: 10 };
    vi.mocked(axios.post as any).mockReturnValueOnce(mockRes);
    studentsInfoError(mockParams);
    expect(axios.post).toHaveBeenCalledWith("/api/studentsInfoError", mockParams);
  });
});
