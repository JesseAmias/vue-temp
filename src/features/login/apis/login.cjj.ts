import { describe, expect, it, vi, beforeEach } from "vitest";
import { useLogin, postLogin } from "./login";
import { axios } from "@/lib/axios";
import { flushPromises, mount } from "@vue/test-utils";

import type { Plugin } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
function createVueQueryPlugin(): [Plugin, { queryClient: QueryClient }] {
  const queryClient = new QueryClient();
  return [VueQueryPlugin, { queryClient }];
}

const [vueQueryPlugin, options] = createVueQueryPlugin();

vi.mock("@/lib/axios", () => ({
  axios: {
    post: vi.fn(),
  },
}));

// vi.mock("./login", async () => {
//   const mockRes = {
//     message: "ok",
//     data: { token: "abc123" },
//     code: "200",
//     msg: "ok",
//     errorCodeHigherLevel: "",
//     errorMsgHigherLevel: "",
//     originErrorCode: "",
//     originErrorMsg: "",
//     appVersion: "",
//   };
//   return {
//     ...(await vi.importActual("./login")),
//     postLogin: vi.fn().mockResolvedValue(mockRes),
//   };
// });

// import { postLogin } from await import("./login");

describe("postLogin", () => {
  it("成功登录并返回", async () => {
    const mockData = { userName: "admin", userPwd: "123456" };
    const mockRes = { message: "ok", data: { token: "abc123" } };

    vi.mocked(axios.post).mockResolvedValue(mockRes);

    const res = await postLogin(mockData);

    expect(axios.post).toHaveBeenCalledWith("/api/login", mockData);
    expect(res).toEqual(mockRes);
  });
});

describe("uselogin", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // const { mutate: loginMutate } = useLogin({
  //   config: {
  //     onSuccess: successSpy,
  //   },
  // });

  it("调用postlogin 并成功返回结果", async () => {
    const successSpy = vi.fn();

    const wrapper = mount(
      defineComponent({
        setup() {
          const login = useLogin({
            config: {
              onSuccess: successSpy,
            },
          });
          const handleLogin = () => {
            login.mutate({
              userName: "admin",
              userPwd: "123456",
            });
          };
          return { login, handleLogin };
        },
        template: `<button @click="handleLogin">登录</button>`,
      }),
      {
        global: {
          plugins: [[vueQueryPlugin, options]],
        },
      },
    );
    await wrapper.find("button").trigger("click");
    await flushPromises();
    // expect(postLogin).toHaveBeenCalledWith({
    //   userName: "admin",
    //   userPwd: "123456",
    // });
    expect(successSpy).toHaveBeenCalled();
  });
});
