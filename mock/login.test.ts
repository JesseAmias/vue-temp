import { describe, it, expect } from "vitest";
import LoginMock from "./login";

const loginApi = LoginMock.find((item) => item.url === "/api/login");
const loginOut = LoginMock.find((item) => item.url === "/api/logout");

if (!loginApi || !loginOut) {
  throw new Error("mock 接口未找到，请检查 URL 是否正确");
}

describe.each([
  [
    { userName: "test1", userPwd: "123" },
    { code: 1, message: "用户名不存在" },
  ],
  [
    { userName: "test", userPwd: "1234" },
    { code: 1, message: "密码错误" },
  ],
  [
    { userName: "test", userPwd: "123" },
    {
      code: 0,
      message: "登录成功",
      data: {
        token: "mock-token-123",
        userName: "test",
      },
    },
  ],
])("登录接口测试 %#", (input, expected) => {
  it(`输入: ${JSON.stringify(input)}`, () => {
    const result = loginApi.response({ body: input });
    expect(result).toEqual(expected);
  });
});

describe("登出接口", () => {
  it("登出", () => {
    const result = loginOut?.response({ body: {} });
    expect(result).toEqual({
      code: 0,
      message: "登出成功",
    });
  });
});
