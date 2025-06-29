export const useTokenStore = defineStore("token", () => {
  const token = ref(localStorage.getItem("token") || "");

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
  }

  const clearToken = () => {
    token.value = "";
    localStorage.removeItem("token");
  };

  return { token, setToken, clearToken };
});

export function useTokenStoreHook() {
  return useTokenStore();
}
