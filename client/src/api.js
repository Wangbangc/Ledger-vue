import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export const getRecords = (month) => api.get('/records', { params: { month } })
export const addRecord = (data) => api.post('/records', data)
export const deleteRecord = (id) => api.delete(`/records/${id}`)
export const getStats = (month) => api.get('/stats', { params: { month } })

// 每日记录
export const getDailyLogGraph = (year) => api.get('/daily-logs/graph', { params: { year } })
export const getDailyLogTodos = (date) => api.get(`/daily-logs/${date}`)
export const addDailyTodo = (date, content) => api.post(`/daily-logs/${date}/todos`, { content })
export const updateDailyTodo = (id, data) => api.put(`/daily-logs/todos/${id}`, data)
export const deleteDailyTodo = (id) => api.delete(`/daily-logs/todos/${id}`)
export const reorderTodos = (orders) => api.put('/daily-logs/todos/reorder', { orders })

// 习惯管理
export const getHabits = () => api.get('/habits')
export const createHabit = (data) => api.post('/habits', data)
export const deleteHabit = (id) => api.delete(`/habits/${id}`)
