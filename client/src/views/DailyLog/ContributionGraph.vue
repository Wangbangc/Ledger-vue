<template>
  <div class="graph-card">
    <div class="graph-header">
      <span class="graph-title">{{ year }} 年记录</span>
      <span class="graph-count">{{ totalDays }} 次记录</span>
    </div>

    <div class="graph-scroll">
      <div class="graph-container">
        <!-- 星期标签 -->
        <div class="weekday-labels">
          <span></span>
          <span>一</span>
          <span></span>
          <span>三</span>
          <span></span>
          <span>五</span>
          <span></span>
        </div>

        <!-- 网格 -->
        <div class="grid-wrapper">
          <!-- 月份标签 -->
          <div class="month-labels">
            <span v-for="(m, i) in monthLabels" :key="i" :style="{ gridColumn: m.col }">{{ m.label }}</span>
          </div>
          <!-- 格子列 -->
          <div class="grid">
            <div class="grid-col" v-for="(week, wi) in weeks" :key="wi">
              <el-tooltip
                v-for="(day, di) in week"
                :key="di"
                :content="tooltipContent(day)"
                placement="top"
                :show-after="200"
              >
                <div
                  class="cell"
                  :class="{ selected: day.date === selectedDate }"
                  :style="{ background: cellColor(day) }"
                  @click="$emit('select', day.date)"
                />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 色阶图例 -->
    <div class="legend">
      <span class="legend-label">少</span>
      <div class="legend-cell" v-for="(c, i) in colors" :key="i" :style="{ background: c }" />
      <span class="legend-label">多</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: { type: Number, required: true },
  graphData: { type: Array, default: () => [] },
  selectedDate: { type: String, default: '' },
})

defineEmits(['select'])

const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']

// 构建日期 -> 数据的映射
const dataMap = computed(() => {
  const map = {}
  props.graphData.forEach(item => {
    map[item.log_date] = item
  })
  return map
})

const totalDays = computed(() => props.graphData.length)

// 生成 52 周的网格数据
const weeks = computed(() => {
  const result = []
  const yearStart = new Date(props.year, 0, 1)

  // 找到第一周的周日
  const startDay = yearStart.getDay()
  const firstSunday = new Date(yearStart)
  firstSunday.setDate(firstSunday.getDate() - startDay)

  const current = new Date(firstSunday)

  for (let w = 0; w < 53; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = formatDate(current)
      const inYear = current.getFullYear() === props.year
      const data = dataMap.value[dateStr]

      week.push({
        date: dateStr,
        inYear,
        total: data ? Number(data.total) : 0,
        done: data ? Number(data.done) : 0,
      })
      current.setDate(current.getDate() + 1)
    }
    result.push(week)
  }

  return result
})

// 月份标签
const monthLabels = computed(() => {
  const labels = []
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  let lastMonth = -1

  weeks.value.forEach((week, wi) => {
    const firstDay = week[0]
    if (!firstDay.inYear) {
      const inYearDay = week.find(d => d.inYear)
      if (inYearDay) {
        const m = new Date(inYearDay.date + 'T00:00:00').getMonth()
        if (m !== lastMonth) {
          labels.push({ label: monthNames[m], col: wi + 1 })
          lastMonth = m
        }
      }
    } else {
      const m = new Date(firstDay.date + 'T00:00:00').getMonth()
      if (m !== lastMonth) {
        labels.push({ label: monthNames[m], col: wi + 1 })
        lastMonth = m
      }
    }
  })

  return labels
})

function cellColor(day) {
  if (!day.inYear) return 'transparent'
  if (day.total === 0) return colors[0]
  const ratio = day.done / day.total
  if (ratio <= 0) return colors[0]
  if (ratio <= 0.25) return colors[1]
  if (ratio <= 0.5) return colors[2]
  if (ratio <= 0.75) return colors[3]
  return colors[4]
}

function tooltipContent(day) {
  if (!day.inYear) return ''
  if (day.total === 0) return `${day.date} · 无记录`
  return `${day.date} · ${day.done}/${day.total} 完成`
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<style scoped>
.graph-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.graph-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.graph-count {
  font-size: 12px;
  color: #909399;
}
.graph-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.graph-container {
  display: flex;
  gap: 4px;
  min-width: fit-content;
}
.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #909399;
  padding-top: 18px;
}
.weekday-labels span {
  height: 12px;
  display: flex;
  align-items: center;
}
.grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.month-labels {
  display: grid;
  grid-template-columns: repeat(53, 1fr);
  height: 16px;
  font-size: 10px;
  color: #909399;
}
.grid {
  display: flex;
  gap: 2px;
}
.grid-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: outline 0.15s;
  outline: 2px solid transparent;
}
.cell:hover {
  outline-color: #409eff;
}
.cell.selected {
  outline-color: #409eff;
  outline-offset: 1px;
}
.legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  justify-content: flex-end;
}
.legend-label {
  font-size: 11px;
  color: #909399;
}
.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
@media (max-width: 768px) {
  .graph-card {
    padding: 12px;
  }
  .cell {
    width: 10px;
    height: 10px;
  }
}
</style>
