import { useTokenStoreHook } from "@/stores/token";
import Axios, { AxiosError } from "axios";
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  CLIENT_ERROR: 400,
  AUTHENTICATE: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const handleHttpCode = (error: AxiosError<{ code: string; msg: string }>) => {
  // const code = error.response?.status;
  return Promise.reject(error);
  // switch (error.code) {
  //   case HTTP_STATUS.AUTHENTICATE: {
  //     return Promise.reject(error);
  //   }
  //   default: {
  //     return Promise.reject(error);
  //   }
  // }
};

export const axios = Axios.create({
  baseURL: "",
});

// 请求拦截
axios.interceptors.request.use((config) => {
  const tokenStore = useTokenStoreHook();
  if (tokenStore.token) {
    config.headers.Authorization = `Bearer ${tokenStore.token}`;
  }

  if (config && config.headers) {
    config.headers.Accept = "application/json";
  }

  return config;
});

// 响应拦截
axios.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 401) {
      ElMessage.warning("请登录");
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    return handleHttpCode(error);
  },
);
