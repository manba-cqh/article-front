<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { authService } from './services/auth'
import PlagiarismChecker from './components/PlagiarismChecker.vue'
import { useRouter } from 'vue-router'
import eventBus from './utils/eventBus'

const currentUser = ref(null)
const loading = ref(true)
const router = useRouter()

const loadUser = async () => {
  try {
    loading.value = true
    if (authService.isAuthenticated()) {
      currentUser.value = await authService.getCurrentUser()
    }
  } catch (error) {
    console.error('加载用户信息失败:', error.message)
    if (!error.message.includes('未登录')) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  try {
    authService.logout()
    currentUser.value = null
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error.message)
    alert('退出登录失败，请稍后重试')
  }
}

onMounted(() => {
  loadUser();
  eventBus.on('login-success', loadUser);
});
onUnmounted(() => {
  eventBus.off('login-success', loadUser);
});
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <img src="/icon.png" class="logo" alt="Logo" />
            <span class="brand-text">Turnitin</span>
          </router-link>
        </div>
        
        <div class="nav-links">
          <template v-if="currentUser">
            <div class="user-info">
              <div class="user-avatar">
                <span class="avatar-text">{{ (currentUser.email || currentUser.username).charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-details">
                <span class="welcome-text">欢迎回来</span>
                <span class="user-name">{{ currentUser.email || currentUser.username }}</span>
              </div>
            </div>
            <div class="nav-actions">
              <button @click="handleLogout" class="logout-btn">
                <span class="logout-icon">🚪</span>
                <span class="logout-text">退出</span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="auth-links">
              <router-link to="/login" class="auth-link login-link">登录</router-link>
              <router-link to="/register" class="auth-link register-link">注册</router-link>
            </div>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
body, #app {
  margin: 0;
  padding: 0;
  width: 100vw;
  min-width: 0;
  background: #f5f6fa;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #EAF1F3;
}

.navbar {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #313a46 0%, #2c3e50 100%);
  padding: 0;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.brand-link:hover {
  transform: translateY(-1px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-text {
  background: linear-gradient(45deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.avatar-text {
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.welcome-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.user-name {
  font-size: 0.875rem;
  color: white;
  font-weight: 600;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logout-icon {
  font-size: 1rem;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-link {
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.login-link {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.login-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.register-link {
  color: #313a46;
  background: white;
  border-color: white;
}

.register-link:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.main-content {
  flex: 1;
  padding: 1rem 2rem;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* PC端优化 */
@media (min-width: 1200px) {
  .nav-container {
    max-width: 100%;
    padding: 0 3rem;
    min-height: 72px;
  }
  
  .brand-link {
    font-size: 1.75rem;
    gap: 1rem;
  }
  
  .brand-text {
    font-size: 1.75rem;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .user-info {
    padding: 0.75rem 1.5rem;
    gap: 1rem;
  }
  
  .user-avatar {
    width: 44px;
    height: 44px;
  }
  
  .avatar-text {
    font-size: 1.125rem;
  }
  
  .user-details {
    gap: 0.375rem;
  }
  
  .welcome-text {
    font-size: 0.875rem;
  }
  
  .user-name {
    font-size: 1rem;
    max-width: 300px;
  }
  
  .logout-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    gap: 0.75rem;
  }
  
  .logout-icon {
    font-size: 1.125rem;
  }
  
  .auth-links {
    gap: 1.5rem;
  }
  
  .auth-link {
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
  }
  
  .main-content {
    padding-left: 0;
    padding-right: 0;
  }
}

@media (min-width: 1600px) {
  .nav-container {
    max-width: 100%;
    padding: 0 4rem;
    min-height: 80px;
  }
  
  .brand-link {
    font-size: 2rem;
    gap: 1.25rem;
  }
  
  .brand-text {
    font-size: 2rem;
  }
  
  .logo {
    width: 48px;
    height: 48px;
  }
  
  .user-info {
    padding: 1rem 2rem;
    gap: 1.25rem;
  }
  
  .user-avatar {
    width: 52px;
    height: 52px;
  }
  
  .avatar-text {
    font-size: 1.25rem;
  }
  
  .user-details {
    gap: 0.5rem;
  }
  
  .welcome-text {
    font-size: 1rem;
  }
  
  .user-name {
    font-size: 1.125rem;
    max-width: 400px;
  }
  
  .logout-btn {
    padding: 1rem 2rem;
    font-size: 1.125rem;
    gap: 1rem;
  }
  
  .logout-icon {
    font-size: 1.25rem;
  }
  
  .auth-links {
    gap: 2rem;
  }
  
  .auth-link {
    padding: 1rem 2.25rem;
    font-size: 1.125rem;
  }
  
  .main-content {
    padding-left: 0;
    padding-right: 0;
  }
}

/* 中等屏幕优化 */
@media (max-width: 1024px) and (min-width: 769px) {
  .nav-container {
    max-width: 100%;
    padding: 0 1.5rem;
    min-height: 60px;
  }
  
  .brand-link {
    font-size: 1.375rem;
    gap: 0.625rem;
  }
  
  .brand-text {
    font-size: 1.375rem;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .user-info {
    padding: 0.5rem 1.25rem;
    gap: 0.875rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-text {
    font-size: 1.125rem;
  }
  
  .user-details {
    gap: 0.25rem;
  }
  
  .welcome-text {
    font-size: 0.75rem;
  }
  
  .user-name {
    font-size: 0.9375rem;
    max-width: 250px;
  }
  
  .logout-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
    gap: 0.625rem;
  }
  
  .logout-icon {
    font-size: 1.125rem;
  }
  
  .auth-links {
    gap: 1.25rem;
  }
  
  .auth-link {
    padding: 0.625rem 1.5rem;
    font-size: 0.9375rem;
  }
  
  .main-content {
    padding-left: 0;
    padding-right: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
    min-height: 56px;
  }
  
  .navbar {
    padding: 0;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .user-info {
    padding: 0.375rem 0.75rem;
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .avatar-text {
    font-size: 0.875rem;
  }
  
  .user-details {
    gap: 0.125rem;
  }
  
  .welcome-text {
    font-size: 0.625rem;
  }
  
  .user-name {
    font-size: 0.75rem;
    max-width: 100px;
  }
  
  .logout-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  .logout-text {
    display: none;
  }
  
  .auth-links {
    gap: 0.75rem;
  }
  
  .auth-link {
    padding: 0.375rem 1rem;
    font-size: 0.75rem;
  }
  
  .brand-text {
    font-size: 1.25rem;
  }
  
  .main-content {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.75rem;
    min-height: 52px;
  }
  
  .nav-links {
    gap: 0.75rem;
  }
  
  .user-info {
    padding: 0.25rem 0.5rem;
    gap: 0.375rem;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .avatar-text {
    font-size: 0.75rem;
  }
  
  .user-details {
    display: none;
  }
  
  .logout-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
  }
  
  .auth-links {
    gap: 0.5rem;
  }
  
  .auth-link {
    padding: 0.25rem 0.75rem;
    font-size: 0.625rem;
  }
  
  .brand-text {
    font-size: 1.125rem;
  }
  
  .logo {
    width: 28px;
    height: 28px;
  }
  
  .main-content {
    padding: 0.75rem 1rem;
  }
}

/* 动画效果 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar {
  animation: fadeInDown 0.3s ease-out;
}

.user-info,
.logout-btn,
.auth-link {
  animation: fadeInDown 0.4s ease-out;
}
</style>
