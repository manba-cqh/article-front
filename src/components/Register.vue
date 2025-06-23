<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>注册账号</h2>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" block>
            注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authService } from '../services/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  password: '',
  confirmPassword: '',
  email: ''
})

const rules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await authService.register({
          email: form.email,
          password: form.password
        })
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .register-container {
    padding: 30px;
    min-height: calc(100vh - 120px);
  }
  
  .register-card {
    max-width: 600px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 16px;
  }
  
  :deep(.el-input__inner) {
    font-size: 16px;
    padding: 12px 16px;
  }
  
  :deep(.el-button) {
    font-size: 18px;
    padding: 14px 24px;
  }
}

@media (min-width: 1600px) {
  .register-container {
    padding: 40px;
    min-height: calc(100vh - 160px);
  }
  
  .register-card {
    max-width: 700px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 18px;
  }
  
  :deep(.el-input__inner) {
    font-size: 16px;
    padding: 14px 18px;
  }
  
  :deep(.el-button) {
    font-size: 20px;
    padding: 16px 28px;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .register-container {
    padding: 25px;
    min-height: calc(100vh - 100px);
  }
  
  .register-card {
    max-width: 450px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 15px;
  }
  
  :deep(.el-input__inner) {
    font-size: 16px;
    padding: 10px 14px;
  }
  
  :deep(.el-button) {
    font-size: 17px;
    padding: 12px 20px;
  }
}

@media (max-width: 768px) {
  .register-container {
    padding: 16px;
    min-height: calc(100vh - 120px);
  }
  
  .register-card {
    max-width: 100%;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
  }
  
  :deep(.el-input__inner) {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  :deep(.el-button) {
    font-size: 16px;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 12px;
  }
  
  :deep(.el-card__header) {
    padding: 16px;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 13px;
    line-height: 1.4;
  }
  
  :deep(.el-input__inner) {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  :deep(.el-button) {
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .login-link {
    font-size: 13px;
    margin-top: 12px;
  }
}
</style> 