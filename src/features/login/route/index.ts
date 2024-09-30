const Layout = () => import(/* webpackChunkName: "Layout" */ '@/components/Layout.vue')
const Login = () => import(/* webpackChunkName: "Login" */ '.')

// 展示扩展屏幕等硬件设备信息
export const loginRoutes = [
  {
    path: '/login',
    component: Layout,
    children: [
      {
        path: '',
        component: Login
      }
    ]
  }
]
