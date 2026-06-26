<template>
  <div class="todo-item" :class="{ done: todo.is_done }">
    <div class="todo-check" @click="$emit('toggle', todo.id, todo.is_done)">
      <div class="check-circle" :class="{ checked: todo.is_done }">
        <el-icon v-if="todo.is_done"><Check /></el-icon>
      </div>
    </div>
    <div class="todo-content" v-if="!isEditing" @dblclick="startEdit">
      <span class="todo-text">{{ todo.content }}</span>
    </div>
    <div class="todo-edit" v-else>
      <el-input
        ref="editInput"
        v-model="editContent"
        size="small"
        @keyup.enter="finishEdit"
        @keyup.escape="cancelEdit"
        @blur="finishEdit"
      />
    </div>
    <div class="todo-actions">
      <el-button
        type="danger"
        :icon="Delete"
        text
        size="small"
        class="delete-btn"
        @click="$emit('delete', todo.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Check, Delete } from '@element-plus/icons-vue'

const props = defineProps({ todo: Object })
const emit = defineEmits(['toggle', 'update', 'delete'])

const isEditing = ref(false)
const editContent = ref('')
const editInput = ref(null)

function startEdit() {
  editContent.value = props.todo.content
  isEditing.value = true
  nextTick(() => editInput.value?.focus())
}

function finishEdit() {
  if (editContent.value.trim() && editContent.value !== props.todo.content) {
    emit('update', props.todo.id, editContent.value.trim())
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fdf6ec;
  border-radius: 6px;
  border-left: 3px solid #e6a23c;
  transition: all 0.3s;
}
.todo-item.done {
  background: #f0f9eb;
  border-left-color: #67c23a;
}
.todo-check {
  cursor: pointer;
  flex-shrink: 0;
}
.check-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.check-circle.checked {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
  font-size: 12px;
}
.todo-content {
  flex: 1;
  min-width: 0;
}
.todo-text {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}
.done .todo-text {
  text-decoration: line-through;
  color: #909399;
}
.todo-edit {
  flex: 1;
}
.todo-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.todo-item:hover .todo-actions {
  opacity: 1;
}
.delete-btn {
  color: #f56c6c !important;
}
</style>
