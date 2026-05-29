<template>
  <div class="list-card">
    <h3>记录列表</h3>
    <el-empty v-if="records.length === 0" description="暂无记录" />
    <div v-else class="record-list">
      <div
        v-for="r in records"
        :key="r.id"
        class="record-item"
        :class="r.type"
      >
        <div class="record-left">
          <el-tag :type="r.type === 'income' ? 'success' : 'danger'" size="small" effect="dark" round>
            {{ r.category }}
          </el-tag>
          <span v-if="r.note" class="note">{{ r.note }}</span>
        </div>
        <div class="record-right">
          <span class="date">{{ r.date?.slice(0, 10) }}</span>
          <span class="amount" :class="r.type">
            {{ r.type === 'income' ? '+' : '-' }}¥{{ Number(r.amount).toFixed(2) }}
          </span>
          <el-button type="danger" :icon="Delete" circle size="small" @click="handleDelete(r.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

defineProps({ records: Array })
const emit = defineEmits(['delete'])

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    emit('delete', id)
  } catch {
    // 用户点了取消，不做任何操作
  }
}
</script>

<style scoped>
.list-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
h3 { margin: 0 0 12px; font-size: 16px; }
.record-list { display: flex; flex-direction: column; gap: 10px; }
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: #fafafa;
  transition: box-shadow 0.2s;
}
.record-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.record-item.income { border-left-color: #4caf50; }
.record-item.expense { border-left-color: #f44336; }
.record-left { display: flex; align-items: center; gap: 10px; }
.note { color: #888; font-size: 13px; }
.record-right { display: flex; align-items: center; gap: 12px; }
.date { color: #aaa; font-size: 12px; }
.amount { font-weight: bold; font-size: 15px; min-width: 80px; text-align: right; }
.amount.income { color: #4caf50; }
.amount.expense { color: #f44336; }
</style>
