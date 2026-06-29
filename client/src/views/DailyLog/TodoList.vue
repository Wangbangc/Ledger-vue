<template>
  <div class="todo-list">
    <div class="todo-header">
      <span class="todo-date">{{ displayDate }}</span>
      <div class="todo-header-right">
        <el-dropdown trigger="click" @command="handleSortModeChange">
          <el-button text size="small" class="sort-btn">
            <el-icon><Sort /></el-icon>
            <span class="sort-label">{{ sortModeLabel }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="default" :class="{ 'is-active': sortMode === 'default' }">默认排序</el-dropdown-item>
              <el-dropdown-item command="undone-first" :class="{ 'is-active': sortMode === 'undone-first' }">未完成优先</el-dropdown-item>
              <el-dropdown-item command="newest" :class="{ 'is-active': sortMode === 'newest' }">最新创建</el-dropdown-item>
              <el-dropdown-item command="done-last" :class="{ 'is-active': sortMode === 'done-last' }">已完成置底</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
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
    <div class="todo-items" ref="todoListRef" v-if="todos.length > 0">
      <TodoItem
        v-for="todo in sortedTodos"
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Plus, Sort } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import { getDailyLogTodos, addDailyTodo, updateDailyTodo, deleteDailyTodo, reorderTodos } from '../../api'
import TodoItem from './TodoItem.vue'

const props = defineProps({ date: String })
const emit = defineEmits(['updated'])

const todos = ref([])
const newContent = ref('')
const sortMode = ref('default')
const todoListRef = ref(null)
let sortableInstance = null

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

const sortModeLabel = computed(() => {
  const labels = { default: '默认排序', 'undone-first': '未完成优先', newest: '最新创建', 'done-last': '已完成置底' }
  return labels[sortMode.value] || '默认排序'
})

const sortedTodos = computed(() => {
  const list = [...todos.value]
  switch (sortMode.value) {
    case 'undone-first':
      return list.sort((a, b) => a.is_done - b.is_done || a.sort_order - b.sort_order)
    case 'newest':
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'done-last':
      return list.sort((a, b) => a.is_done - b.is_done)
    default:
      return list.sort((a, b) => a.sort_order - b.sort_order)
  }
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

function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
  nextTick(() => {
    const el = todoListRef.value
    if (!el) return
    sortableInstance = Sortable.create(el, {
      animation: 200,
      ghostClass: 'drag-ghost',
      chosenClass: 'drag-chosen',
      dragClass: 'drag-drag',
      handle: '.todo-item',
      async onEnd(evt) {
        const items = el.querySelectorAll('[data-todo-id]')
        const orders = Array.from(items).map((item, index) => ({
          id: Number(item.dataset.todoId),
          sort_order: index,
        }))
        try {
          await reorderTodos(orders)
          sortMode.value = 'default'
          await loadTodos()
          emit('updated')
        } catch {
          ElMessage.error('排序保存失败')
        }
      },
    })
  })
}

watch(todos, () => {
  initSortable()
})

function handleSortModeChange(mode) {
  sortMode.value = mode
}

onMounted(() => {
  initSortable()
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})
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
.todo-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.todo-progress {
  font-size: 13px;
  color: #909399;
}
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}
.sort-btn:hover {
  color: #409eff;
}
.sort-label {
  font-size: 12px;
}
.drag-ghost {
  opacity: 0.4;
  background: #ecf5ff !important;
  border-left-color: #409eff !important;
}
.drag-chosen {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.drag-drag {
  opacity: 0.9;
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
