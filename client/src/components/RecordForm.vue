<template>
  <div class="form-card">
    <h3>记一笔</h3>
    <el-form label-position="top">
      <el-form-item label="类型">
        <el-radio-group v-model="form.type" size="large">
          <el-radio-button value="expense">支出</el-radio-button>
          <el-radio-button value="income">收入</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="金额">
            <el-input-number v-model="form.amount" :min="0" :precision="2" :step="1" placeholder="金额" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类">
            <el-select v-model="form.category" style="width: 100%">
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="备注">
            <el-input v-model="form.note" placeholder="备注（可选）" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="日期">
            <input type="date" v-model="form.date" class="date-input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-button type="primary" size="large" style="width: 100%; margin-top: 4px;" @click="submit">
        添加记录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['add'])

const expenseCategories = ['餐饮', '交通', '购物', '娱乐', '住房', '医疗', '教育', '其他']
const incomeCategories = ['工资', '奖金', '理财', '兼职', '其他']

const form = reactive({
  type: 'expense',
  amount: undefined,
  category: '餐饮',
  note: '',
  date: new Date().toISOString().slice(0, 10),
})

const categories = computed(() =>
  form.type === 'expense' ? expenseCategories : incomeCategories
)

function submit() {
  if (!form.amount || form.amount <= 0) {
    ElMessage.warning('请输入金额')
    return
  }
  emit('add', { ...form, amount: Number(form.amount) })
  form.amount = undefined
  form.note = ''
}
</script>

<style scoped>
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
h3 { margin: 0 0 16px; font-size: 16px; color: #303133; }
.date-input {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  outline: none;
  box-sizing: border-box;
}
.date-input:focus { border-color: #409eff; }
</style>
