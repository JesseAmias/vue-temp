import { defineStore } from "pinia";
import { store } from "./index";
import { useUserStoreHook } from "./user";
import { useTokenStoreHook } from "./token";

export const useLoginStore = defineStore({
  id: "login",
  state: () => ({
    isLogin: sessionStorage.getItem("isLogin") === "true" || false,
    rememberMe: localStorage.getItem("rememberMe") === "true" || false,
  }),
  actions: {
    async patchLogin(isLogin: boolean, rememberMe: boolean) {
      this.isLogin = isLogin;
      sessionStorage.setItem("isLogin", isLogin.toString());
      this.setRememberMe(rememberMe);
    },

    logout() {
      const userStore = useUserStoreHook();
      const tokenStore = useTokenStoreHook();

      this.isLogin = false;
      sessionStorage.removeItem("isLogin");
      userStore.clearUserInfo();
      tokenStore.clearToken();
    },

    setRememberMe(isRememberMe: boolean) {
      this.rememberMe = isRememberMe;
      localStorage.setItem("rememberMe", isRememberMe.toString());
    },

    removeRememberMe() {
      this.rememberMe = false;
      localStorage.removeItem("rememberMe");
    },
  },
});

export function useLoginStoreHook() {
  return useLoginStore(store);
}
