import { axios } from "@/lib/axios";
import type { MutationConfig } from "@/lib/vue-query";
import { useMutation } from "@tanstack/vue-query";
import type { ErrorType } from "../type";

type loginParam = {
  /** 用户名 */
  userName: string;
  /** 密码 */
  userPwd: string;
};
interface LoginResponse extends ErrorType {
  message: string;
  data: {
    token: string;
  };
}
export const postLogin = (data: loginParam): Promise<LoginResponse> => {
  return axios.post("/api/login", {
    ...data,
  });
};

type UsePostLoginOption = {
  config?: MutationConfig<typeof postLogin>;
};

export const useLogin = ({ config }: UsePostLoginOption = {}) => {
  return useMutation({
    mutationFn: postLogin,
    ...config,
  });
};
