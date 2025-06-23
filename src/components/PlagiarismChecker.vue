<template>
  <div class="plagiarism-checker">
    <div class="content-wrapper">
      <!-- 左侧：上传和查重操作区 -->
      <div class="left-panel">
        <h2>文档查重</h2>
        
        <!-- 文件提交要求提示 -->
        <div class="submission-requirements">
          <h3>📋 提交要求</h3>
          <div class="requirements-list">
            <div class="requirement-item">
              <span class="requirement-icon">📦</span>
              <span>文件大小必须小于 100 MB</span>
            </div>
            <div class="requirement-item">
              <span class="requirement-icon">📄</span>
              <span>文件至少包含 300 个段落格式的单词</span>
            </div>
            <div class="requirement-item">
              <span class="requirement-icon">📏</span>
              <span>字数不得超过 30,000</span>
            </div>
            <div class="requirement-item">
              <span class="requirement-icon">🌏</span>
              <span>内容必须使用英语或西班牙语</span>
            </div>
          </div>
          <div class="privacy-notice">
            <span class="notice-icon">🔒</span>
            <span>注意：文件不会被抄袭或保存在数据库中</span>
          </div>
        </div>
        
        <el-form :model="form" label-width="120px">
          <el-form-item label="上传文件">
            <el-upload
              class="upload-area"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
              accept=".doc,.docx,.pdf,.txt"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 .doc, .docx, .pdf, .txt 格式文件
                </div>
              </template>
            </el-upload>
            
            <!-- 文件信息显示 -->
            <div v-if="selectedFile" class="file-info">
              <div class="file-info-header">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ selectedFile.name }}</span>
              </div>
              <div class="file-details">
                <span class="file-size">大小: {{ formatFileSize(selectedFile.size) }}</span>
                <span class="file-type">类型: {{ getFileType(selectedFile.name) }}</span>
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading"
              :disabled="!selectedFile"
              @click="openSerialDialog"
            >
              开始查重
            </el-button>
          </el-form-item>
        </el-form>
        <!-- 序列号输入弹窗 -->
        <el-dialog v-model="serialDialogVisible" title="请输入序列号" width="400px" :close-on-click-modal="false">
          <el-input v-model="serialInput" placeholder="请输入序列号" />
          <template #footer>
            <el-button @click="serialDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="serialChecking" @click="handleSerialCheck">确定</el-button>
          </template>
        </el-dialog>
      </div>

      <!-- 右侧：查重结果区 -->
      <div class="right-panel">
        <h2>查重结果</h2>
        <!-- 集成报告列表表格 -->
        <el-table :data="reports" style="width: 100%; margin-top: 40px;" @row-click="showDetail">
          <el-table-column prop="report_id" label="Unique ID" />
          <el-table-column prop="submitted_file" label="Submitted file" />
          <el-table-column prop="ai_percent" label="AI" />
          <el-table-column prop="similarity_percent" label="Similarity" />
          <el-table-column prop="status" label="Status">
            <template #default="{ row }">
              <el-tag type="success" v-if="row.status === 'completed'">completed</el-tag>
              <el-tag type="warning" v-else>{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="Created at" />
          <el-table-column label="Delete">
            <template #default="{ row }">
              <el-button @click.stop="deleteReport(row.report_id)" circle>
                <img src="/delete.png" alt="删除" style="width:18px;height:18px;vertical-align:middle;" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailDialogVisible" :title="`Report: ${detailReport.report_id || ''}`" width="500px">
          <div>
            <div style="margin-bottom: 10px;">
              <span>🗎 Submitted file: </span>
              <a :href="detailReport.submitted_file_url" target="_blank" style="color: #20b2aa;">
                {{ detailReport.submitted_file }}
              </a>
            </div>
            <div style="margin-bottom: 10px;">
              <span>🗎 Plagiarism report: </span>
              <a v-if="detailReport.plagiarism_report_url" :href="detailReport.plagiarism_report_url" target="_blank" style="color: #20b2aa;">
                plagiarism_report.pdf
              </a>
              <span v-else>-</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span>🗎 AI report: </span>
              <a v-if="detailReport.ai_report_url" :href="detailReport.ai_report_url" target="_blank" style="color: #20b2aa;">
                ai_report.pdf
              </a>
              <span v-else>-</span>
            </div>
            <div style="margin-bottom: 10px;">
              <span>% Similarity: </span>
              <span>{{ detailReport.similarity_percent }}</span>
            </div>
            <div>
              <span>% AI: </span>
              <span>{{ detailReport.ai_percent }}</span>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { plagwiseService } from '../services/plagwise'
import { api } from '@/services/auth'

const loading = ref(false)
const selectedFile = ref(null)
const report = ref(null)
const form = reactive({})

// 序列号弹窗相关
const serialDialogVisible = ref(false)
const serialInput = ref('')
const serialChecking = ref(false)

const reports = ref([])
let timer = null

const detailDialogVisible = ref(false)
const detailReport = ref({})

const openSerialDialog = () => {
  serialInput.value = ''
  serialDialogVisible.value = true
}

const handleSerialCheck = async () => {
  if (!serialInput.value) {
    ElMessage.warning('请输入序列号')
    return
  }
  serialChecking.value = true
  try {
    // 校验序列号
    await api.post('/validate-serial', { serial: serialInput.value })
    serialDialogVisible.value = false
    handleCheckWithSerial(serialInput.value)
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '序列号校验失败')
  } finally {
    serialChecking.value = false
  }
}

const handleCheckWithSerial = async (serial) => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  loading.value = true
  try {
    // 这里调用 plagwiseService.checkPlagiarism，传递文件即可
    const result = await plagwiseService.checkPlagiarism(selectedFile.value)
    if (result.status === 'completed') {
      report.value = {
        similarity: result.similarity_percent,
        status: result.status,
        details: result.details || []
      }
      ElMessage.success('查重完成')
    }
  } catch (error) {
    ElMessage.error(error.message || '查重失败')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file) => {
  const fileToValidate = file.raw
  
  // 文件验证
  const validationResult = validateFile(fileToValidate)
  
  if (validationResult.isValid) {
    selectedFile.value = fileToValidate
    ElMessage.success('文件验证通过')
  } else {
    ElMessage.error(validationResult.error)
    // 清除文件选择
    selectedFile.value = null
  }
}

// 文件验证函数
const validateFile = (file) => {
  // 检查文件大小 (100MB = 100 * 1024 * 1024 bytes)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '文件大小超过 100 MB 限制'
    }
  }
  
  // 检查文件类型
  const allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '不支持的文件格式，请选择 .doc, .docx, .pdf, .txt 格式的文件'
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件类型
const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const typeMap = {
    'doc': 'Microsoft Word',
    'docx': 'Microsoft Word',
    'pdf': 'PDF',
    'txt': 'Text'
  }
  return typeMap[extension] || 'Unknown'
}

const fetchReports = async () => {
  const res = await api.get('/reports')
  reports.value = res.data
}

const deleteReport = async (report_id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条报告吗？',
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await api.delete(`/reports/${report_id}`)
    ElMessage.success('删除成功')
    fetchReports()
  } catch (err) {
    // 用户取消，无需处理
  }
}

const showDetail = (row) => {
  detailReport.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  fetchReports()
  timer = setInterval(fetchReports, 2000)
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.plagiarism-checker {
  width: 100vw;
  height: calc(100vh - 64px);
  box-sizing: border-box;
  background: #EAF1F3;
  padding: 0;
}
.content-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  gap: 32px;
  padding: 32px 2rem 32px 2rem;
  box-sizing: border-box;
  max-width: 100%;
}
.left-panel, .right-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.left-panel h2, .right-panel h2 {
  margin-bottom: 24px;
}

/* 提交要求样式 */
.submission-requirements {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.submission-requirements h3 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.4;
}

.requirement-icon {
  font-size: 18px;
  min-width: 24px;
  text-align: center;
}

.privacy-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  border-radius: 8px;
  color: #155724;
  font-size: 13px;
  font-weight: 500;
}

.notice-icon {
  font-size: 16px;
}

/* 文件信息显示样式 */
.file-info {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.file-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.file-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6c757d;
}

.file-size, .file-type {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-content {
  margin-top: 16px;
}
.details-section {
  margin-top: 24px;
}
.right-panel {
  flex: 3;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .content-wrapper {
    gap: 40px;
    padding: 40px 6rem;
  }
  
  .left-panel, .right-panel {
    padding: 40px;
  }
  
  .right-panel {
    flex: 4;
  }
  
  .left-panel {
    flex: 1;
    min-width: 400px;
  }
}

@media (min-width: 1600px) {
  .content-wrapper {
    gap: 48px;
    padding: 40px 6rem;
  }
  
  .left-panel, .right-panel {
    padding: 48px;
  }
  
  .right-panel {
    flex: 5;
  }
  
  .left-panel {
    flex: 1;
    min-width: 450px;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .content-wrapper {
    gap: 24px;
    padding: 40px 6rem;
  }
  
  .left-panel, .right-panel {
    padding: 24px;
  }
  
  .right-panel {
    flex: 3;
  }
  
  .left-panel {
    flex: 1;
    min-width: 350px;
  }
}

@media (max-width: 768px) {
  .plagiarism-checker {
    height: auto;
    min-height: calc(100vh - 120px);
  }
  
  .content-wrapper {
    flex-direction: column;
    gap: 16px;
    padding: 16px 1.5rem;
  }
  
  .left-panel, .right-panel {
    padding: 16px;
    flex: none;
  }
  
  .right-panel {
    flex: none;
  }
  
  .submission-requirements {
    padding: 16px;
  }
  
  .requirements-list {
    gap: 8px;
  }
  
  .requirement-item {
    font-size: 13px;
    gap: 8px;
  }
  
  .file-details {
    flex-direction: column;
    gap: 4px;
  }
  
  /* 表格响应式 */
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 8px 4px;
  }
  
  :deep(.el-table .cell) {
    padding: 0 4px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 12px 1rem;
    gap: 12px;
  }
  
  .left-panel, .right-panel {
    padding: 12px;
  }
  
  .left-panel h2, .right-panel h2 {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
  
  .submission-requirements {
    padding: 12px;
  }
  
  .submission-requirements h3 {
    font-size: 14px;
  }
  
  .requirement-item {
    font-size: 12px;
  }
  
  .file-info {
    padding: 12px;
  }
  
  .file-name {
    font-size: 13px;
  }
  
  .file-details {
    font-size: 11px;
  }
  
  /* 表格进一步优化 */
  :deep(.el-table) {
    font-size: 11px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 6px 2px;
  }
  
  :deep(.el-table .cell) {
    padding: 0 2px;
  }
  
  /* 隐藏某些列在小屏幕上 */
  :deep(.el-table .el-table__cell:nth-child(2)),
  :deep(.el-table .el-table__cell:nth-child(6)) {
    display: none;
  }
}
</style> 