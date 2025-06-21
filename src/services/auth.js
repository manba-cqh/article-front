import axios from 'axios'
import config from '../config.js'

const API_URL = config.API_BASE_URL

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 调试信息
    console.log('🚀 发送请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    })
    
    return config
  },
  error => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并重定向到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // 用户注册
  async register(userData) {
    try {
      const response = await api.post('/register', userData)
      return response.data
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('注册失败，请稍后重试')
    }
  },

  // 用户登录
  async login(username, password) {
    try {
      // 参数验证
      if (!username || !username.trim()) {
        throw new Error('用户名不能为空')
      }
      if (!password || !password.trim()) {
        throw new Error('密码不能为空')
      }
      
      const requestData = {
        username: username.trim(),
        password: password
      }
      
      console.log('发送登录请求:', { username: requestData.username, password: '***' })
      
      // 尝试 JSON 格式
      try {
        const response = await api.post('/token', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // 保存 token 到 localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
      }
      
      return response.data
      } catch (jsonError) {
        // 如果 JSON 格式失败，尝试 form-urlencoded 格式
        if (jsonError.response?.status === 422) {
          console.log('JSON 格式失败，尝试 form-urlencoded 格式')
          
          const formData = new URLSearchParams()
          formData.append('username', requestData.username)
          formData.append('password', requestData.password)
          
          const response = await api.post('/token', formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          
          // 保存 token 到 localStorage
          if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token)
          }
          
          return response.data
        } else {
          throw jsonError
        }
      }
    } catch (error) {
      console.error('登录错误:', error.response?.data || error.message)
      
      if (error.response?.data?.detail) {
        // 处理 Pydantic 验证错误
        if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail.map(err => err.msg).join(', ')
          throw new Error(errorMessages)
        } else {
        throw new Error(error.response.data.detail)
      }
      }
      
      if (error.response?.status === 422) {
        throw new Error('请求数据格式错误，请检查输入')
      }
      
      if (error.response?.status === 401) {
        throw new Error('用户名或密码错误')
      }
      
      throw new Error('登录失败，请检查用户名和密码')
    }
  },

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未登录')
      }

      const response = await api.get('/users/me')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        throw new Error('登录已过期，请重新登录')
      }
      throw new Error('获取用户信息失败，请稍后重试')
    }
  },

  // 更新用户的 report_id_list
  async updateReportIdList(reportId) {
    try {
      const response = await api.post('/users/update-reports', { report_id: reportId })
      return response.data
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error('更新报告列表失败，请稍后重试')
    }
  },

  // 退出登录
  logout() {
    localStorage.removeItem('token')
  },

  // 检查是否已登录
  isAuthenticated() {
    return !!localStorage.getItem('token')
  }
} 