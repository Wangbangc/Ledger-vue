import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Stats from '../views/Statistics.vue'
import JsonFormat from '../views/JsonFormat.vue'
import DailyLog from '../views/DailyLog/index.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/', name: 'DailyLog', component: DailyLog },
  { path: '/accounting', name: 'Home', component: Home },
  { path: '/stats', name: 'Stats', component: Stats },
  { path: '/json', name: 'JsonFormat', component: JsonFormat },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login')
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    next('/')
  } else {
    next()
  }
})

export default router
