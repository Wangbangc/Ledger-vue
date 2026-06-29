<template>
  <div v-if="habits.length > 0" class="habit-progress">
    <h3 class="habit-progress-title">习惯进度</h3>
    <div
      v-for="habit in habits"
      :key="habit.id"
      class="habit-card"
    >
      <div class="habit-card-header">
        <span class="habit-name">{{ habit.name }}</span>
        <span class="habit-days">{{ habit.completed_days }}/{{ habit.total_days }} 天</span>
      </div>
      <el-progress
        :percentage="progressPercent(habit)"
        :color="progressColor(habit)"
        :stroke-width="10"
      />
      <div class="habit-card-footer">
        <span class="habit-streak">连续打卡: {{ habit.streak || 0 }} 天</span>
        <span v-if="habit.last_done_date" class="habit-last-date">
          最近: {{ habit.last_done_date }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHabits } from '../../api'

const habits = ref([])

const progressPercent = (habit) => {
  if (!habit.total_days) return 0
  return Math.round(habit.completed_days / habit.total_days * 100)
}

const progressColor = (habit) => {
  const pct = progressPercent(habit)
  if (pct >= 80) return '#216e39'
  if (pct >= 60) return '#30a14e'
  if (pct >= 40) return '#40c463'
  if (pct >= 20) return '#9be9a8'
  return '#ebedf0'
}

const loadHabits = async () => {
  try {
    const res = await getHabits()
    habits.value = res.data || []
  } catch (e) {
    console.error('Failed to load habits:', e)
  }
}

defineExpose({ loadHabits })

onMounted(loadHabits)
</script>

<style scoped>
.habit-progress {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.habit-progress-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.habit-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.habit-card:last-child {
  margin-bottom: 0;
}

.habit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.habit-name {
  font-weight: 500;
  font-size: 14px;
}

.habit-days {
  font-size: 13px;
  color: #606266;
}

.habit-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
