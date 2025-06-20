<template>
  <div class="flex min-h-screen items-center justify-center bg-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div class="text-center mb-8">
          <img class="mx-auto h-12 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="您的公司" />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">欢迎登录管理系统</h2>
        </div>

        <el-form ref="ruleFormRef" size="large" label-position="top" :model="formData" :rules="rules" label-width="auto">
          <el-form-item label="用户名">
            <el-input v-model="formData.username" autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="formData.password" type="password" />
          </el-form-item>
          <el-form-item>
            <div class="flex flex-1 items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" v-model="rememberMe" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900"> 记住我 </label>
              </div>

              <div class="text-sm">
                <a href="#" @click="forgotPassword" class="font-medium text-indigo-600 hover:text-indigo-500"> 忘记密码？ </a>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" style="width: 100%" :disabled="hasError">登录</el-button>
          </el-form-item>
        </el-form>
        <!-- <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
            <div class="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                v-model="username"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" v-model="rememberMe" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900"> 记住我 </label>
            </div>

            <div class="text-sm">
              <a href="#" @click="forgotPassword" class="font-medium text-indigo-600 hover:text-indigo-500"> 忘记密码？ </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="hasError"
            >
              登录
            </button>
          </div>
        </form> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogin } from "@/features/login/apis";
import { useLoginStoreHook } from "@/stores/login";
import CryptoJS from "crypto-js";
import type { FormInstance, FormRules } from "element-plus";

interface RuleForm {
  username: string;
  password: string;
}

const router = useRouter();
const store = useLoginStoreHook();

// const username = ref("");
// const password = ref("");

const hasError = ref(false); // New reactive variable for error state
const rememberMe = ref(false);

const ruleFormRef = ref<FormInstance>();
const formData = reactive<RuleForm>({
  username: "",
  password: "",
});

const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
});

onMounted(() => {
  const usernameStore = localStorage.getItem("username");
  const passwordStore = localStorage.getItem("password");
  if (usernameStore && passwordStore) {
    const decrypted = decryptUserData(usernameStore, passwordStore);
    formData.username = decrypted.decryptedUsername;
    formData.password = decrypted.decryptedPassword;
    rememberMe.value = true;
  }
});
const validateForm = () => {
  hasError.value = !formData.username || !formData.password; // Check if fields are empty
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

const { mutate: loginMutate } = useLogin({
  config: {
    onSuccess: (data) => {
      if (!data.code) {
        ElMessage({
          message: "登录成功",
          type: "success",
        });
        store.patchLogin(true);
        if (rememberMe.value) {
          const encrypted = encryptUserData(formData.username, formData.password);
          localStorage.setItem("username", encrypted.encryptedUsername);
          localStorage.setItem("password", encrypted.encryptedPassword);
        } else {
          localStorage.removeItem("username");
          localStorage.removeItem("password");
        }
        router.replace({
          path: "/admin",
        });
      } else {
        ElMessage({
          message: data.message,
          type: "error",
        });
      }
    },
    onError(error) {
      console.error("请求失败：", error);
      ElMessage({
        message: "请求失败",
        type: "error",
      });
    },
  },
});

const handleLogin = async () => {
  validateForm(); // Call validation before login
  if (hasError.value) return; // Prevent login if validation fails
  loginMutate({ userName: formData.username, userPwd: formData.password });
};

const forgotPassword = () => {
  ElMessage({
    message: "请联系管理员重置密码",
    type: "warning",
  });
};
</script>

<style scoped lang="scss">
/* 如有需要，请添加其他样式 */
</style>
