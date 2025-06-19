import axios from 'axios'
import { authService } from './auth'
import config from '../config.js'

const API_KEY = 'QAJhXdh1AhdA7lbQhp79dnYh35pMsw8542'
const BASE_URL = config.API_BASE_URL

export const plagwiseService = {
  // 上传文档进行查重
  async checkPlagiarism(file, options = {}) {
    const formData = new FormData()
    formData.append('email', '753818188@qq.com')
    formData.append('api_key', API_KEY)
    formData.append('environment', 'production')
    formData.append('submission_type', 'file')
    formData.append('submitted_file', file)
    formData.append('exclude_bibliography', '1')
    formData.append('exclude_quotes', '0')
    
    try {
      const response = await axios.post('/plagwise/api/submit-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('API响应数据:', response.data)

      // 如果提交成功，更新用户的 report_id_list
      if (response.data && response.data.report_id) {
        await authService.updateReportIdList(response.data.report_id)
      }

      return response.data
    } catch (error) {
      console.error('API错误:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '查重请求失败')
    }
  },

  // 处理 webhook 回调
  handleWebhookCallback(callbackData) {
    console.log('收到 webhook 回调:', callbackData)
    const {
      report_id,
      status,
      error,
      similarity_percent,
      plagiarism_report_url,
      ai_percent,
      ai_report_url,
      slots_balance
    } = callbackData

    // 返回处理后的数据
    return {
      reportId: report_id,
      status,
      error,
      similarityPercent: similarity_percent,
      plagiarismReportUrl: plagiarism_report_url,
      aiPercent: ai_percent,
      aiReportUrl: ai_report_url,
      slotsBalance: slots_balance
    }
  }
} 