<template>
  <div>
    <div class="navbar-wrapper flex justify-between items-center h-[50px] py-0 px-[20px] shadow-[0_1px_4px_rgba(0,21,41,.08)] text-lg font-semibold text-[#333]">
      <div class="title">教学管理系统</div>
      <el-dropdown>
        <div class="el-dropdown-link flex items-center outline-none">
          <el-avatar size="small" :src="circleUrl" />
          <span class="ml-[10px]">Jesse</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon>
                <IconEpUser />
              </el-icon>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon><Setting /></el-icon>设置
            </el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { User } from "@element-plus/icons-vue";

const circleUrl = "https://dev-file.iviewui.com/userinfoPDvn9gKWYihR24SpgC319vXY8qniCqj4/avatar";
onMounted(() => {
  console.log("进入home页结果:\n");
});
</script>

<style lang="scss" scoped></style>
