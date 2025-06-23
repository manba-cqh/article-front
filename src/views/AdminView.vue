<template>
  <div class="admin-container">
    <h2>管理员序列号管理</h2>
    <div class="form-row">
      <el-input v-model.number="count" type="number" min="1" placeholder="请输入生成数量" style="width: 200px; margin-right: 10px;" />
      <el-button type="primary" @click="generateSerials" :loading="loading">生成序列号</el-button>
    </div>
    <el-table :data="serials" style="width: 100%; margin-top: 30px;">
      <el-table-column prop="serial" label="序列号" />
      <el-table-column prop="created_at" label="生成时间">
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../services/auth'

const count = ref(10)
const serials = ref([])
const loading = ref(false)

const fetchSerials = async () => {
  try {
    const response = await api.get('/serials')
    serials.value = response.data
  } catch (error) {
    ElMessage.error('获取序列号列表失败：' + (error.response?.data?.detail || error.message))
  }
}

const generateSerials = async () => {
  if (!count.value || count.value < 1) {
    ElMessage.warning('请输入有效的生成数量')
    return
  }
  
  loading.value = true
  try {
    const response = await api.post('/generate-serials', { count: count.value })
    ElMessage.success('序列号生成成功')
    await fetchSerials()
  } catch (error) {
    ElMessage.error('生成序列号失败：' + (error.response?.data?.detail || error.message))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSerials()
})
</script>

<style scoped>
.admin-container {
  max-width: 100%;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

:deep(.el-table) {
  margin-top: 20px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (min-width: 1200px) {
  .admin-container {
    max-width: 100%;
    margin: 60px auto;
    padding: 50px;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 40px;
  }
  
  .form-row {
    gap: 20px;
    margin-bottom: 30px;
  }
  
  :deep(.el-input) {
    width: 300px !important;
  }
  
  :deep(.el-button) {
    font-size: 18px;
    padding: 14px 28px;
  }
  
  :deep(.el-table) {
    font-size: 16px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 16px 12px;
  }
}

@media (min-width: 1600px) {
  .admin-container {
    max-width: 100%;
    margin: 80px auto;
    padding: 60px;
  }
  
  h2 {
    font-size: 2.25rem;
    margin-bottom: 50px;
  }
  
  .form-row {
    gap: 25px;
    margin-bottom: 40px;
  }
  
  :deep(.el-input) {
    width: 350px !important;
  }
  
  :deep(.el-button) {
    font-size: 20px;
    padding: 16px 32px;
  }
  
  :deep(.el-table) {
    font-size: 18px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 20px 16px;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .admin-container {
    max-width: 100%;
    margin: 50px auto;
    padding: 40px;
  }
  
  h2 {
    font-size: 1.75rem;
    margin-bottom: 35px;
  }
  
  .form-row {
    gap: 15px;
    margin-bottom: 25px;
  }
  
  :deep(.el-input) {
    width: 250px !important;
  }
  
  :deep(.el-button) {
    font-size: 17px;
    padding: 12px 24px;
  }
  
  :deep(.el-table) {
    font-size: 15px;
  }
  
  :deep(.el-table th),
  :deep(.el-table td) {
    padding: 12px 8px;
  }
}

@media (max-width: 768px) {
  .admin-container {
    margin: 20px auto;
    padding: 20px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  :deep(.el-input) {
    width: 100% !important;
    margin-right: 0 !important;
  }
  
  :deep(.el-button) {
    width: 100%;
    font-size: 16px;
    padding: 12px 20px;
  }
  
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
  .admin-container {
    margin: 10px auto;
    padding: 16px;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
  
  .form-row {
    gap: 8px;
  }
  
  :deep(.el-button) {
    font-size: 14px;
    padding: 10px 16px;
  }
  
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
  
  /* 隐藏时间列在小屏幕上 */
  :deep(.el-table .el-table__cell:nth-child(2)) {
    display: none;
  }
}
</style> 