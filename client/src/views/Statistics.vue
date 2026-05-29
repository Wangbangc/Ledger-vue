<template>
  <div class="stats-page">
    <!-- 月份选择 -->
    <div class="month-picker">
      <el-button :icon="ArrowLeft" circle @click="changeMonth(-1)" />
      <span class="month-text">{{ currentMonth }}</span>
      <el-button :icon="ArrowRight" circle @click="changeMonth(1)" />
    </div>

    <!-- 汇总卡片 -->
    <div class="summary-cards">
      <div class="summary-card income">
        <div class="card-icon">↑</div>
        <div class="card-info">
          <div class="card-label">总收入</div>
          <div class="card-amount">¥{{ Number(stats.income).toFixed(2) }}</div>
        </div>
      </div>
      <div class="summary-card expense">
        <div class="card-icon">↓</div>
        <div class="card-info">
          <div class="card-label">总支出</div>
          <div class="card-amount">¥{{ Number(stats.expense).toFixed(2) }}</div>
        </div>
      </div>
      <div class="summary-card balance">
        <div class="card-icon">=</div>
        <div class="card-info">
          <div class="card-label">结余</div>
          <div class="card-amount">¥{{ Number(stats.balance).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="chart-title">支出分类</span>
          </template>
          <div ref="expenseChartRef" class="chart-box"></div>
          <el-empty v-if="expenseCategories.length === 0" description="暂无支出数据" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="chart-title">收入分类</span>
          </template>
          <div ref="incomeChartRef" class="chart-box"></div>
          <el-empty v-if="incomeCategories.length === 0" description="暂无收入数据" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类明细表格 -->
    <el-card shadow="never" class="detail-card" v-if="stats.categories && stats.categories.length > 0">
      <template #header>
        <span class="chart-title">分类明细</span>
      </template>
      <el-table :data="sortedCategories" stripe size="small">
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            {{ row.type === 'income' ? '收入' : '支出' }}
          </template>
        </el-table-column>
        <el-table-column label="金额" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'income' ? '#4caf50' : '#f44336', fontWeight: 'bold' }">
              ¥{{ Number(row.total).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="占比" width="100" align="right">
          <template #default="{ row }">
            {{ getPercent(row) }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getStats } from '../api'

const now = new Date()
const currentMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const stats = ref({ income: 0, expense: 0, balance: 0, categories: [] })

const expenseChartRef = ref(null)
const incomeChartRef = ref(null)
let expenseChart = null
let incomeChart = null

const expenseCategories = computed(() =>
  (stats.value.categories || []).filter(c => c.type === 'expense')
)
const incomeCategories = computed(() =>
  (stats.value.categories || []).filter(c => c.type === 'income')
)
const sortedCategories = computed(() =>
  [...(stats.value.categories || [])].sort((a, b) => Number(b.total) - Number(a.total))
)

function getPercent(row) {
  const total = row.type === 'income' ? stats.value.income : stats.value.expense
  if (!total) return '0.0'
  return ((Number(row.total) / Number(total)) * 100).toFixed(1)
}

async function loadData() {
  try {
    const { data } = await getStats(currentMonth.value)
    stats.value = data
    await nextTick()
    renderCharts()
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

function changeMonth(delta) {
  const [y, m] = currentMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  currentMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function renderCharts() {
  // 支出饼图
  if (expenseChartRef.value && expenseCategories.value.length > 0) {
    if (!expenseChart) {
      expenseChart = echarts.init(expenseChartRef.value)
    }
    expenseChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      color: ['#f44336', '#ff7043', '#ffab91', '#d32f2f', '#e57373', '#ff8a80', '#c62828', '#ff5252'],
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
        data: expenseCategories.value.map(c => ({ name: c.category, value: Number(c.total) })),
      }],
    })
  } else if (expenseChart) {
    expenseChart.clear()
  }

  // 收入饼图
  if (incomeChartRef.value && incomeCategories.value.length > 0) {
    if (!incomeChart) {
      incomeChart = echarts.init(incomeChartRef.value)
    }
    incomeChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      color: ['#4caf50', '#66bb6a', '#81c784', '#388e3c', '#a5d6a7', '#43a047', '#2e7d32', '#69f0ae'],
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 12 },
        data: incomeCategories.value.map(c => ({ name: c.category, value: Number(c.total) })),
      }],
    })
  } else if (incomeChart) {
    incomeChart.clear()
  }
}

function handleResize() {
  expenseChart?.resize()
  incomeChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  expenseChart?.dispose()
  incomeChart?.dispose()
})

watch(currentMonth, loadData)
</script>

<style scoped>
.stats-page { max-width: 900px; }
.month-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.month-text { font-size: 18px; font-weight: 600; color: #303133; min-width: 100px; text-align: center; }

.summary-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.summary-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-radius: 12px;
  color: #fff;
}
.summary-card.income { background: linear-gradient(135deg, #43a047, #66bb6a); }
.summary-card.expense { background: linear-gradient(135deg, #e53935, #ef5350); }
.summary-card.balance { background: linear-gradient(135deg, #1e88e5, #42a5f5); }
.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}
.card-label { font-size: 13px; opacity: 0.85; }
.card-amount { font-size: 20px; font-weight: bold; margin-top: 2px; }

.chart-card {
  margin-bottom: 16px;
  border-radius: 12px;
}
.chart-title { font-size: 15px; font-weight: 600; color: #303133; }
.chart-box { height: 280px; }

.detail-card {
  border-radius: 12px;
}
</style>
