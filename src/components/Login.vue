<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          required
          placeholder="请输入邮箱"
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
          placeholder="请输入密码"
        />
      </div>
      
      <div class="error-message" v-if="error">{{ error }}</div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <div class="register-link">
        还没有账号？ <router-link to="/register">立即注册</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/auth'
import eventBus from '../utils/eventBus'
import { debugUtils } from '../utils/debug'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const formData = reactive({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  try {
    error.value = ''
    
    // 添加表单验证
    if (!formData.email || !formData.email.trim()) {
      error.value = '请输入邮箱'
      return
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      error.value = '请输入正确的邮箱格式'
      return
    }
    
    if (!formData.password || !formData.password.trim()) {
      error.value = '请输入密码'
      return
    }
    
    // 调试信息
    debugUtils.validateFormData(formData)
    
    loading.value = true
    
    const response = await authService.login(formData.email.trim(), formData.password)
    eventBus.emit('login-success')
    
    // 获取用户信息
    const user = await authService.getCurrentUser()
    
    // 根据用户角色跳转到不同页面
    if (user.is_admin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('登录失败:', err)
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: 500;
  color: #555;
}

input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 