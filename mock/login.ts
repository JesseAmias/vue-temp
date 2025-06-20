export default [
  {
    url: "/api/login",
    method: "post",
    response: ({ body }) => {
      const { userName, userPwd } = body;

      const users = [
        { userName: "admin", userPwd: "123" },
        { userName: "test", userPwd: "abc123" },
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
];
