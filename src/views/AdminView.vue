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
  max-width: 800px;
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
</style> 