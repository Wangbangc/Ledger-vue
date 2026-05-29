<template>
  <div class="home">
    <div class="month-picker">
      <el-button :icon="ArrowLeft" circle @click="changeMonth(-1)" />
      <span class="month-text">{{ currentMonth }}</span>
      <el-button :icon="ArrowRight" circle @click="changeMonth(1)" />
    </div>
    <MonthlyStats :stats="stats" />
    <RecordForm @add="handleAdd" />
    <RecordList :records="records" @delete="handleDelete" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRecords, getStats, addRecord, deleteRecord } from '../api'
import MonthlyStats from '../components/MonthlyStats.vue'
import RecordForm from '../components/RecordForm.vue'
import RecordList from '../components/RecordList.vue'

const now = new Date()
const currentMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const records = ref([])
const stats = ref({ income: 0, expense: 0, balance: 0, categories: [] })

async function loadData() {
  try {
    const [r, s] = await Promise.all([
      getRecords(currentMonth.value),
      getStats(currentMonth.value),
    ])
    records.value = r.data
    stats.value = s.data
  } catch (err) {
    console.error('加载数据失败:', err)
  }
}

function changeMonth(delta) {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function handleAdd(data) {
  try {
    await addRecord(data)
    loadData()
  } catch {
    ElMessage.error('添加失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteRecord(id)
    loadData()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(loadData)
watch(currentMonth, loadData)
</script>

<style scoped>
.home { max-width: 520px; margin: 0 auto; }
.month-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.month-text { font-size: 18px; font-weight: 600; color: #303133; min-width: 100px; text-align: center; }
</style>
