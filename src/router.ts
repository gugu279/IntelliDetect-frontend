import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Dashboard from './components/Dashboard.vue'
import AccidentList from './components/AccidentList.vue'
import AccidentDetail from './components/AccidentDetail.vue'
import UserInfo from './components/UserInfo.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/accidents',
    name: 'AccidentList',
    component: AccidentList,
    meta: { requiresAuth: true }
  },
  {
    path: '/accidents/:id',
    name: 'AccidentDetail',
    component: AccidentDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/:id',
    name: 'UserInfo',
    component: UserInfo,
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = localStorage.getItem('token') !== null

  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router