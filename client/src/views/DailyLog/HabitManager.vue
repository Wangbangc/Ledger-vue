<template>
  <div class="habit-manager">
    <div class="habit-header">
      <span class="habit-title">习惯管理</span>
      <el-button type="primary" size="small" @click="openDialog">
        <el-icon><Plus /></el-icon>
        <span>新建习惯</span>
      </el-button>
    </div>

    <!-- 习惯列表 -->
    <div class="habit-list" v-if="habits.length > 0">
      <div class="habit-card" v-for="habit in habits" :key="habit.id">
        <div class="habit-info">
          <div class="habit-name">{{ habit.name }}</div>
          <div class="habit-meta">
            <span class="habit-schedule">{{ formatSchedule(habit.schedule) }}</span>
            <span class="habit-divider">|</span>
            <span>开始: {{ habit.start_date }}</span>
            <span class="habit-divider">|</span>
            <span>{{ habit.total_days }} 天</span>
          </div>
        </div>
        <el-button
          type="danger"
          text
          size="small"
          @click="handleDelete(habit)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="还没有习惯，点击右上角新建" :image-size="120" />
    </div>

    <!-- 新建习惯对话框 -->
    <el-dialog
      v-model="showDialog"
      title="新建习惯"
      width="420px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="习惯名称" required>
          <el-input
            v-model="form.name"
            placeholder="请输入习惯名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="执行日" required>
          <el-checkbox-group v-model="form.scheduleDays">
            <el-checkbox
              v-for="(day, index) in weekDays"
              :key="index"
              :label="index"
            >
              {{ day }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="form.start_date"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="总天数">
          <el-input-number
            v-model="form.total_days"
            :min="1"
            :max="365"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHabits, createHabit, deleteHabit } from '../../api'

const emit = defineEmits(['created'])

const habits = ref([])
const showDialog = ref(false)
const submitting = ref(false)

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const form = reactive({
  name: '',
  scheduleDays: [],
  start_date: '',
  total_days: 30,
})

function formatSchedule(schedule) {
  if (!schedule) return ''
  return schedule
    .split(',')
    .map((n) => weekDays[Number(n)])
    .join('、')
}

async function loadHabits() {
  try {
    const res = await getHabits()
    habits.value = res.data || []
  } catch {
    ElMessage.error('加载习惯列表失败')
  }
}

async function handleSubmit() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入习惯名称')
    return
  }
  if (form.scheduleDays.length === 0) {
    ElMessage.warning('请至少选择一个执行日')
    return
  }
  if (!form.start_date) {
    ElMessage.warning('请选择开始日期')
    return
  }

  submitting.value = true
  try {
    const schedule = [...form.scheduleDays].sort((a, b) => a - b).join(',')
    await createHabit({
      name: form.name.trim(),
      schedule,
      start_date: form.start_date,
      total_days: form.total_days,
    })
    ElMessage.success('习惯创建成功，已生成待办')
    showDialog.value = false
    await loadHabits()
    emit('created')
  } catch {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(habit) {
  try {
    await ElMessageBox.confirm(`确定删除习惯「${habit.name}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteHabit(habit.id)
    ElMessage.success('删除成功')
    await loadHabits()
  } catch {
    // 用户取消
  }
}

function openDialog() {
  showDialog.value = true
}

function resetForm() {
  form.name = ''
  form.scheduleDays = []
  form.start_date = ''
  form.total_days = 30
}

onMounted(loadHabits)
</script>

<style scoped>
.habit-manager {
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.habit-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.habit-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 16px;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.habit-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.habit-divider {
  color: #dcdfe6;
}

.empty-state {
  padding: 20px 0;
}
</style>
