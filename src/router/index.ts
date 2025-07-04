import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { loginRoutes } from "@/features/login";
import { adminRoutes } from "@/features/admin";
import { homeRoutes } from "@/features/home";
import { useLoginStoreHook } from "@/stores/login";

const loginStore = useLoginStoreHook();

// 合并所有路由
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  ...loginRoutes,
  ...adminRoutes,
  ...homeRoutes,
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
  scrollBehavior(to) {
    if (to.hash) {
      // 如果目标路由有hash，滚动到对应的元素
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    // 否则滚动到页面顶部
    return {
      top: 0,
      left: 0,
      behavior: "smooth",
    };
  },
});

// 导航守卫，判断是否登录
router.beforeEach((to, from, next) => {
  if (to.path !== "/login" && !loginStore.isLogin) {
    // next({ path: "/login" });
    next();
  } else {
    next();
  }
});

export default router;
