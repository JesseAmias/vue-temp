export default [
  {
    url: "/api/login",
    method: "post",
    response: ({ body }: any) => {
      const { userName, userPwd } = body;

      const users = [
        { userName: "admin", userPwd: "Aa!123456" },
        { userName: "test", userPwd: "123" },
      ];

      const user = users.find((user) => user.userName === userName);
      if (!user) {
        return { code: 1, message: "用户名不存在" };
      }
      if (user.userPwd !== userPwd) {
        return { code: 1, message: "密码错误" };
      }
      return {
        code: 0,
        message: "登录成功",
        data: {
          token: "mock-token-123",
          userName,
        },
      };
    },
  },
  {
    // 登出
    url: "/api/logout",
    method: "post",
    response: () => {
      return {
        code: 0,
        message: "登出成功",
      };
    },
  },
];
