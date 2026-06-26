<template>
  <div class="daily-log">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">连续记录</div>
        <div class="stat-value green">{{ streak }} 天</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今年记录天数</div>
        <div class="stat-value blue">{{ graphData.length }} 天</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均完成率</div>
        <div class="stat-value orange">{{ avgRate }}%</div>
      </div>
    </div>

    <!-- 贡献图 -->
    <ContributionGraph
      :year="currentYear"
      :graph-data="graphData"
      :selected-date="selectedDate"
      @select="handleSelectDate"
    />

    <!-- 待办清单 -->
    <TodoList
      :date="selectedDate"
      @updated="loadGraph"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDailyLogGraph } from '../../api'
import ContributionGraph from './ContributionGraph.vue'
import TodoList from './TodoList.vue'

const currentYear = new Date().getFullYear()
const today = formatDate(new Date())
const selectedDate = ref(today)
const graphData = ref([])

// 连续记录天数
const streak = computed(() => {
  const dates = graphData.value.map(d => d.log_date).sort().reverse()
  if (dates.length === 0) return 0
  let count = 0
  const checkDate = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(checkDate)
    if (dates.includes(dateStr)) {
      count++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return count
})

// 平均完成率
const avgRate = computed(() => {
  const withTodos = graphData.value.filter(d => Number(d.total) > 0)
  if (withTodos.length === 0) return 0
  const totalRate = withTodos.reduce((sum, d) => sum + (Number(d.done) / Number(d.total)), 0)
  return Math.round(totalRate / withTodos.length * 100)
})

async function loadGraph() {
  try {
    const res = await getDailyLogGraph(currentYear)
    graphData.value = res.data
  } catch (err) {
    console.error('加载贡献图数据失败:', err)
  }
}

function handleSelectDate(date) {
  selectedDate.value = date
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

onMounted(loadGraph)
</script>

<style scoped>
.daily-log {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.stats-cards {
  display: flex;
  gap: 16px;
}
.stat-card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
}
.stat-value.green { color: #67c23a; }
.stat-value.blue { color: #409eff; }
.stat-value.orange { color: #e6a23c; }

@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
    gap: 8px;
  }
  .stat-card {
    padding: 12px 16px;
  }
  .stat-value {
    font-size: 22px;
  }
}
</style>
