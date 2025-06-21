// 环境配置
const config = {
  // 开发环境
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    PLAGWISE_API_URL: 'https://plagwise.com/api'
  },
  // 生产环境
  production: {
    API_BASE_URL: 'https://article-backend-eight.vercel.app/api',
    PLAGWISE_API_URL: 'https://plagwise.com/api'
  }
}

// 根据当前环境获取配置
const env = import.meta.env.MODE || 'development'
const currentConfig = config[env]

export default currentConfig 