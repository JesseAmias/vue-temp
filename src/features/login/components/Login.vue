<template>
  <div class="flex grid grid-cols-1 md:grid-cols-2 gap-4 min-h-screen items-center justify-center bg-indigo-100 px-3 py-12 sm:px-6 lg:px-[150px]" :style="bgStyle">
    <div class="login-left flex items-center justify-center relative px-10">
      <div class="text-center text-white z-10 relative max-w-md">
        <div>
          <div class="w-24 h-24 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center logo-glow">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold mb-2">欢迎登录教学管理系统</h1>
          <p class="text-xl opacity-90">Teaching management system</p>
          <p class="description mt-10 text-white/80">请使用您的账户信息登录系统</p>
        </div>

        <div class="space-y-4 text-center hidden lg:block mt-8">
          <p class="text-lg opacity-90">数字化管理</p>
          <p class="text-lg opacity-90">提升教学效率</p>
          <p class="text-lg opacity-90">智能化的课程安排</p>
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <div class="w-full max-w-md">
        <div class="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div class="text-center mb-8">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">登录</h2>
          </div>

          <el-form ref="ruleFormRef" size="large" label-position="top" :model="formData" :rules="rules" label-width="auto">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
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
  </div>
</template>

<script setup lang="ts">
import { useLogin } from "@/features/login/apis";
import { useLoginStoreHook } from "@/stores/login";
import { useUserStoreHook } from "@/stores/user";
import { useTokenStoreHook } from "@/stores/token";
import type { FormInstance, FormRules } from "element-plus";
import { View, Hide } from "@element-plus/icons-vue";
import { useDebounceFn } from "@vueuse/core";
import bgImage from "@/assets/imgs/login-bg.jpg";

type UserInfo = {
  username: string;
  password: string;
};

const router = useRouter();
const loginStore = useLoginStoreHook();
const userStore = useUserStoreHook();
const tokenStore = useTokenStoreHook();

const rememberMe = ref(false);

const ruleFormRef = ref<FormInstance>();
const formData = reactive<UserInfo>({
  username: "",
  password: "",
});

const passwordView = ref(false);
// 引入一张assets/imgs里面的图

const bgStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

const passwordValidator = (rule: any, value: any, callback: (error?: string) => void) => {
  if (formData.username === "test") {
    callback(); // 校验通过
  } else {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/;
    if (!value) {
      callback("请输入密码");
    } else if (!pattern.test(value)) {
      callback("格式错误，8-20位，需同时包含大小写字母、数字、特殊字符");
    } else {
      callback();
    }
  }
};

const rules = reactive<FormRules<UserInfo>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 20, message: "用户名长度为 4-20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { validator: passwordValidator, trigger: "blur" },
  ],
});

onMounted(() => {
  initForm();
});

const initForm = async () => {
  userStore.getUserInfo();
  const rememberMeStore = loginStore.rememberMe;
  if (rememberMeStore) {
    const { username, password } = userStore.userInfo;
    if (username && password) {
      formData.username = username;
      formData.password = password;
      rememberMe.value = true;
    }
  }
};

const { mutate: loginMutate } = useLogin({
  config: {
    onSuccess: async (data) => {
      if (!data.code) {
        ElMessage({
          message: "登录成功",
          type: "success",
        });
        loginStore.patchLogin(true, rememberMe.value);
        tokenStore.setToken(data.data.token);
        userStore.setUserInfo(formData.username, formData.password);

        // 等待响应式刷新
        await nextTick();

        // 稍作延迟，确保拦截器能获取最新 token
        setTimeout(() => {
          router.replace({ path: "/home" });
        }, 0);
        // router.replace({
        //   path: "/home",
        // });
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

<style scoped lang="scss"></style>
