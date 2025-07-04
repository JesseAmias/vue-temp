import { defineStore } from "pinia";
import { store } from "./index";
import CryptoJS from "crypto-js";
import { useLoginStoreHook } from "./login";

type UserInfo = {
  username: string;
  password: string;
};

const encryptUserData = (username: string, password: string) => {
  const encryptedUsername = CryptoJS.AES.encrypt(username, "secretKey").toString();
  const encryptedPassword = CryptoJS.AES.encrypt(password, "secretKey").toString();
  return { encryptedUsername, encryptedPassword };
};

const decryptUserData = (encryptedUsername: string, encryptedPassword: string) => {
  const decryptedUsername = CryptoJS.AES.decrypt(encryptedUsername, "secretKey").toString(CryptoJS.enc.Utf8);
  const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, "secretKey").toString(CryptoJS.enc.Utf8);
  return { decryptedUsername, decryptedPassword };
};

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo>({ username: "", password: "" });

  const loginStore = useLoginStoreHook();

  function setUserInfo(username: string, password: string) {
    userInfo.value = { username, password };

    if (loginStore.isLogin && loginStore.rememberMe && username && password) {
      const encrypted = encryptUserData(username, password);
      localStorage.setItem("username", encrypted.encryptedUsername);
      localStorage.setItem("password", encrypted.encryptedPassword);

      loginStore.setRememberMe(true);
    }

    if (!loginStore.rememberMe) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");

      loginStore.removeRememberMe();
    }
  }

  function getUserInfo() {
    const usernameStore = localStorage.getItem("username");
    const passwordStore = localStorage.getItem("password");
    if (usernameStore && passwordStore) {
      const decrypted = decryptUserData(usernameStore, passwordStore);
      userInfo.value = { username: decrypted.decryptedUsername, password: decrypted.decryptedPassword };

      loginStore.setRememberMe(true);
    }
  }

  function clearUserInfo() {
    userInfo.value = { username: "", password: "" };
    if (!loginStore.rememberMe) {
      localStorage.removeItem("username");
      localStorage.removeItem("password");

      loginStore.removeRememberMe();
    }
  }

  return { userInfo, setUserInfo, getUserInfo, clearUserInfo };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
