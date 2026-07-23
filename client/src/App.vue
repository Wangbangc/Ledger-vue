<template>
  <div v-if="!isLoggedIn" id="app">
    <router-view />
  </div>
  <div v-else class="layout">
    <aside class="sidebar">
      <div class="sidebar-title">记账本</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#ffffffb3"
        active-text-color="#fff"
      >
        <el-menu-item index="/">
          <el-icon><component :is="Calendar" /></el-icon>
          <span>每日记录</span>
        </el-menu-item>
        <el-menu-item index="/accounting">
          <el-icon><component :is="Notebook" /></el-icon>
          <span>记账</span>
        </el-menu-item>
        <el-menu-item index="/stats">
          <el-icon><component :is="DataAnalysis" /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/json">
          <el-icon><component :is="DocumentCopy" /></el-icon>
          <span>JSON 格式化</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <div class="main-area">
      <header class="top-bar">
        <span class="page-title">{{ pageTitle }}</span>
        <div class="top-right">
          <span class="nav-user">{{ username }}</span>
          <el-button type="danger" text @click="logout">登出</el-button>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Notebook, DataAnalysis, DocumentCopy, Calendar } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isLoggedIn = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')

watch(route, () => {
  isLoggedIn.value = !!localStorage.getItem('token')
  username.value = localStorage.getItem('username') || ''
})
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  if (route.path === '/accounting') return '记账'
  if (route.path === '/stats') return '数据统计'
  if (route.path === '/json') return 'JSON 格式化'
  return '每日记录'
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  router.push('/login')
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; }
</style>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 200px;
  background: #001529;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-title {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  border-bottom: 1px solid #ffffff1a;
}
.sidebar :deep(.el-menu) {
  border-right: none;
}
.sidebar :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}
.sidebar :deep(.el-menu-item.is-active) {
  background: #1890ff !important;
}
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.top-bar {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-shrink: 0;
}
.page-title { font-size: 17px; font-weight: 600; color: #303133; }
.top-right { display: flex; align-items: center; gap: 12px; }
.nav-user { font-size: 14px; color: #666; }
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .top-bar {
    padding: 0 12px;
  }
  .page-title {
    font-size: 15px;
  }
  .content {
    padding: 12px;
  }
}
</style>
