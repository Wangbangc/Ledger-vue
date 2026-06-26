<template>
  <div class="todo-list">
    <div class="todo-header">
      <span class="todo-date">{{ displayDate }}</span>
      <span class="todo-progress">{{ doneCount }}/{{ totalCount }} 完成</span>
    </div>

    <!-- 新增待办输入框 -->
    <div class="add-todo">
      <el-input
        v-model="newContent"
        placeholder="添加新的待办事项..."
        :prefix-icon="Plus"
        @keyup.enter="handleAdd"
        clearable
      />
    </div>

    <!-- 待办列表 -->
    <div class="todo-items" v-if="todos.length > 0">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="handleToggle"
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="今天还没有待办，添加一个吧" :image-size="120" />
    </div>

    <!-- 完成进度条 -->
    <div class="progress-bar" v-if="todos.length > 0">
      <div class="progress-info">
        <span>今日完成进度</span>
        <span class="progress-text">{{ doneCount }}/{{ totalCount }} ({{ progressPercent }}%)</span>
      </div>
      <el-progress
        :percentage="progressPercent"
        :stroke-width="8"
        :color="progressColor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDailyLogTodos, addDailyTodo, updateDailyTodo, deleteDailyTodo } from '../../api'
import TodoItem from './TodoItem.vue'

const props = defineProps({ date: String })
const emit = defineEmits(['updated'])

const todos = ref([])
const newContent = ref('')

const displayDate = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date + 'T00:00:00')
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${props.date} ${days[d.getDay()]}`
})

const doneCount = computed(() => todos.value.filter(t => t.is_done).length)
const totalCount = computed(() => todos.value.length)
const progressPercent = computed(() => totalCount.value === 0 ? 0 : Math.round(doneCount.value / totalCount.value * 100))
const progressColor = computed(() => {
  if (progressPercent.value >= 80) return '#216e39'
  if (progressPercent.value >= 60) return '#30a14e'
  if (progressPercent.value >= 40) return '#40c463'
  if (progressPercent.value >= 20) return '#9be9a8'
  return '#ebedf0'
})

async function loadTodos() {
  if (!props.date) return
  try {
    const res = await getDailyLogTodos(props.date)
    todos.value = res.data.todos
  } catch {
    ElMessage.error('加载待办失败')
  }
}

async function handleAdd() {
  const content = newContent.value.trim()
  if (!content) return
  try {
    await addDailyTodo(props.date, content)
    newContent.value = ''
    await loadTodos()
    emit('updated')
  } catch {
    ElMessage.error('添加失败')
  }
}

async function handleToggle(id, isDone) {
  try {
    await updateDailyTodo(id, { is_done: isDone ? 0 : 1 })
    await loadTodos()
    emit('updated')
  } catch {
    ElMessage.error('更新失败')
  }
}

async function handleUpdate(id, content) {
  try {
    await updateDailyTodo(id, { content })
    await loadTodos()
  } catch {
    ElMessage.error('更新失败')
  }
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除这条待办？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDailyTodo(id)
    await loadTodos()
    emit('updated')
  } catch {
    // 用户取消
  }
}

watch(() => props.date, loadTodos, { immediate: true })
</script>

<style scoped>
.todo-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.todo-date {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.todo-progress {
  font-size: 13px;
  color: #909399;
}
.add-todo {
  margin-bottom: 12px;
}
.todo-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.empty-state {
  padding: 20px 0;
}
.progress-bar {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}
.progress-text {
  font-weight: 600;
  color: #67c23a;
}
</style>
