import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/PlagiarismChecker.vue'),
      meta: { requiresAuth: true, requiresUser: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/Register.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // 未登录，重定向到登录页
      next({ name: 'login' })
      return
    }
    
    try {
      // 获取当前用户信息
      const user = await authService.getCurrentUser()
      
      // 检查管理员权限
      if (to.meta.requiresAdmin && !user.is_admin) {
        // 非管理员访问管理员页面，重定向到首页
        next({ name: 'home' })
        return
      }
      
      // 检查普通用户权限
      if (to.meta.requiresUser && user.is_admin) {
        // 管理员访问普通用户页面，重定向到管理员页面
        next({ name: 'admin' })
        return
      }
      
      // 权限验证通过
      next()
    } catch (error) {
      // 获取用户信息失败，可能是token过期
      authService.logout()
      next({ name: 'login' })
    }
  } else {
    // 不需要认证的路由直接通过
    next()
  }
})

export default router
