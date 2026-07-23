<template>
  <div class="auth-page">
    <el-card class="auth-card">
      <h2>注册</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleRegister">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="至少 6 位" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" native-type="submit">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="link">
        <span>已有账号？</span>
        <router-link to="/login">去登录</router-link>
      </div>
    </el-card>
    <div class="auth-footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">黔ICP备2026010442号</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '../api'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '', confirmPassword: '' })

const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

async function handleRegister() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await register({ username: form.username, password: form.password })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.response?.data?.error || err.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
.auth-card { width: 400px; }
h2 { text-align: center; margin-bottom: 20px; color: #2196f3; }
.link { text-align: center; margin-top: 8px; font-size: 14px; }
.link a { color: #2196f3; text-decoration: none; }
.auth-footer { position: fixed; bottom: 0; left: 0; right: 0; height: 40px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
.auth-footer a { font-size: 12px; color: #999; text-decoration: none; }
.auth-footer a:hover { color: #666; }
</style>
