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
      <div class="nav-brand">
        <router-link to="/"><img src="/icon.png" class="logo" /></router-link>
      </div>
      <div class="nav-links">
        <template v-if="currentUser">
          <span class="welcome-text">欢迎, {{ currentUser.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </template>
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
  background-color: #313a46;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-sizing: border-box;
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.welcome-text {
  margin-right: 1rem;
}

.admin-link {
  color: #409EFF;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.admin-link:hover {
  background-color: #ecf5ff;
}

.logout-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: white;
  color: #4CAF50;
}

.main-content {
  flex: 1;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 0;
  width: 100%;
}

.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
</style>
