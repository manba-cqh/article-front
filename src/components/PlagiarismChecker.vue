<template>
  <div class="plagiarism-checker">
    <div class="content-wrapper">
      <!-- 左侧：上传和查重操作区 -->
      <div class="left-panel">
        <h2>文档查重</h2>
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
  selectedFile.value = file.raw
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
  padding: 32px 0 32px 0;
  box-sizing: border-box;
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
.result-content {
  margin-top: 16px;
}
.details-section {
  margin-top: 24px;
}
.right-panel {
  flex: 3;
}
</style> 