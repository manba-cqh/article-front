// 调试工具
export const debugUtils = {
  // 打印请求信息
  logRequest(url, data, headers) {
    console.group('🔍 API 请求调试')
    console.log('URL:', url)
    console.log('数据:', data)
    console.log('请求头:', headers)
    console.groupEnd()
  },

  // 打印响应信息
  logResponse(response) {
    console.group('✅ API 响应调试')
    console.log('状态码:', response.status)
    console.log('响应头:', response.headers)
    console.log('响应数据:', response.data)
    console.groupEnd()
  },

  // 打印错误信息
  logError(error) {
    console.group('❌ API 错误调试')
    console.log('错误对象:', error)
    console.log('响应状态:', error.response?.status)
    console.log('响应数据:', error.response?.data)
    console.log('请求配置:', error.config)
    console.groupEnd()
  },

  // 验证表单数据
  validateFormData(formData) {
    const issues = []
    
    if (!formData.email || !formData.email.trim()) {
      issues.push('邮箱为空')
    } else {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        issues.push('邮箱格式不正确')
      }
    }
    
    if (!formData.password || !formData.password.trim()) {
      issues.push('密码为空')
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ 表单验证问题:', issues)
      return false
    }
    
    console.log('✅ 表单数据验证通过')
    return true
  }
} 