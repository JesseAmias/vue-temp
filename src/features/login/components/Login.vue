<template>
  <div class="flex min-h-screen items-center justify-center bg-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div class="text-center mb-8">
          <img class="mx-auto h-12 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600" alt="您的公司" />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">欢迎登录管理系统</h2>
        </div>

        <el-form ref="ruleFormRef" size="large" label-position="top" :model="formData" :rules="rules" label-width="auto">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <!-- <el-input v-model="formData.password" type="password" /> -->
            <el-input v-model="formData.password" :type="passwordView ? 'text' : 'password'" placeholder="请输入密码">
              <template #suffix>
                <span @click="passwordView = !passwordView" class="cursor-pointer">
                  <el-icon v-if="passwordView" :size="16"><View /></el-icon>
                  <el-icon v-else :size="16"><Hide /></el-icon>
                </span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <div class="flex flex-1 items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" v-model="rememberMe" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900"> 记住我 </label>
              </div>

              <div class="text-sm">
                <a href="javascript:(0)" @click="forgotPassword" class="font-medium text-indigo-600 hover:text-indigo-500"> 忘记密码？ </a>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="() => debounceLogin(ruleFormRef)" style="width: 100%">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogin } from "@/features/login/apis";
import { useLoginStoreHook } from "@/stores/login";
import CryptoJS from "crypto-js";
import type { FormInstance, FormRules } from "element-plus";
import { View, Hide } from "@element-plus/icons-vue";
import { useDebounceFn } from "@vueuse/core";

interface RuleForm {
  username: string;
  password: string;
}

const router = useRouter();
const store = useLoginStoreHook();

const rememberMe = ref(false);

const ruleFormRef = ref<FormInstance>();
const formData = reactive<RuleForm>({
  username: "",
  password: "",
});

const passwordView = ref(false);

const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 20, message: "用户名长度为 4-20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/,
      message: "格式错误，8-20位，需同时包含大小写字母、数字、特殊字符",
      trigger: "blur",
    },
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

const debounceLogin = useDebounceFn((formEl: FormInstance | undefined) => {
  handleLogin(formEl);
}, 300);

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
      loginMutate({ userName: formData.username, userPwd: formData.password });
    } else {
      console.log("error submit!", fields);
    }
  });
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
