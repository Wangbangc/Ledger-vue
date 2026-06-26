# 记账本 (Bookkeeping)

个人记账与每日记录应用，支持用户注册登录，每人独立管理自己的收支记录和每日待办。提供 GitHub 风格贡献图、月度统计、分类饼图可视化，以及 JSON 格式化工具。前端 Vue 3 + Vite + Element Plus + ECharts，后端 Express + MySQL。

## 功能概览

- **每日记录（主页）** — GitHub 风格贡献图，每日待办清单，支持添加/完成/编辑/删除，颜色深浅反映完成比例
- **用户认证** — 注册 / 登录，JWT 鉴权，密码 bcrypt 加密
- **收支记账** — 新增、删除记录，按月查看，支持 13 个支出分类和 5 个收入分类
- **月度统计** — 收入 / 支出 / 结余汇总卡片
- **数据统计** — 分类饼图（ECharts）、分类明细表格，支持按月筛选
- **JSON 格式化** — 独立工具页，支持格式化、压缩、语法高亮、一键复制
- **数据隔离** — 每个用户只能查看和操作自己的记录

### 支出分类

餐饮、交通、购物、娱乐、住房、医疗、教育、日用品、通讯、社交、旅行、宠物、其他

### 收入分类

工资、奖金、理财、兼职、其他

## 项目结构

```
demo/
├── client/              # 前端 (Vue 3 + Vite + Element Plus + ECharts)
│   ├── src/
│   │   ├── api.js              # Axios 封装 + token 拦截器
│   │   ├── main.js             # 入口，注册 Element Plus / Router
│   │   ├── App.vue             # 根组件（侧边导航栏 + 顶栏 + router-view）
│   │   ├── router/
│   │   │   └── index.js        # 路由配置 + 登录守卫
│   │   ├── views/
│   │   │   ├── DailyLog/       # 每日记录（主页）
│   │   │   │   ├── index.vue           # 主页面（统计卡片 + 贡献图 + 待办清单）
│   │   │   │   ├── ContributionGraph.vue # GitHub 风格贡献图组件
│   │   │   │   ├── TodoList.vue        # 待办清单组件
│   │   │   │   └── TodoItem.vue        # 单条待办组件
│   │   │   ├── Home.vue        # 记账（月度切换 + 统计卡片 + 记录列表）
│   │   │   ├── Statistics.vue  # 数据统计（饼图 + 分类明细表）
│   │   │   ├── JsonFormat.vue  # JSON 格式化工具
│   │   │   ├── Login.vue       # 登录页
│   │   │   └── Register.vue    # 注册页
│   │   └── components/
│   │       ├── MonthlyStats.vue  # 月度统计卡片（收入/支出/结余）
│   │       ├── RecordForm.vue    # 新增记录表单
│   │       └── RecordList.vue    # 记录列表（含删除）
│   └── package.json
├── server/              # 后端 (Express + MySQL2)
│   ├── app.js                # 入口，挂载路由与中间件
│   ├── db.js                 # MySQL 连接池
│   ├── middleware/
│   │   └── auth.js           # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.js           # 注册 / 登录路由
│   │   ├── records.js        # 记录 CRUD + 月度统计
│   │   └── dailyLogs.js      # 每日记录 CRUD + 贡献图数据
│   └── package.json
└── init.sql             # 数据库初始化脚本
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API, `<script setup>`) |
| 构建工具 | Vite 5 |
| 路由 | Vue Router 4 (HTML5 History 模式) |
| UI 组件库 | Element Plus 2.14 |
| 图表 | ECharts 6 |
| HTTP 客户端 | Axios 1.6 (含 JWT 拦截器) |
| 后端框架 | Express 4.18 |
| 数据库驱动 | MySQL2 3.6 (连接池，Promise API) |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 数据库 | MySQL 5.7+ (utf8mb4) |

## 环境要求

- Node.js >= 16
- MySQL >= 5.7

## 启动步骤

### 1. 初始化数据库

执行初始化脚本创建数据库和五张表（`records`、`users`、`user_records`、`daily_logs`、`daily_todos`）：

```bash
mysql -u root -p --default-character-set=utf8mb4 < init.sql
```

如需修改数据库密码，编辑 `server/db.js` 中的 `password` 字段。

### 2. 启动后端

```bash
cd server
npm install    # 首次运行需要安装依赖
npm start
```

后端运行在 http://localhost:3000

### 3. 启动前端

```bash
cd client
npm install    # 首次运行需要安装依赖
npm run dev
```

前端运行在 http://localhost:5173，Vite 会自动将 `/api` 请求代理到后端。

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | Login.vue | 登录页 |
| `/register` | Register.vue | 注册页（密码最少 6 位，需确认密码） |
| `/` | DailyLog/index.vue | 每日记录（主页），贡献图 + 待办清单 |
| `/accounting` | Home.vue | 记账，按月切换，含统计卡片和记录列表 |
| `/stats` | Statistics.vue | 数据统计，分类饼图 + 明细表格 |
| `/json` | JsonFormat.vue | JSON 格式化工具（纯前端，格式化 / 压缩 / 高亮 / 复制） |

未登录用户自动跳转到 `/login`，已登录用户访问 `/login` 或 `/register` 自动跳转到 `/`。

## 数据库表结构

### records — 记账记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, 自增主键 | 记录 ID |
| type | ENUM('income', 'expense') | 收入 / 支出 |
| amount | DECIMAL(10,2) | 金额 |
| category | VARCHAR(50) | 分类 |
| note | VARCHAR(200) | 备注 |
| date | DATE | 记账日期 |
| created_at | DATETIME | 创建时间 |

### users — 用户

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, 自增主键 | 用户 ID |
| username | VARCHAR(50), UNIQUE | 用户名 |
| password | VARCHAR(255) | 密码（bcrypt 哈希） |
| created_at | DATETIME | 注册时间 |

### user_records — 用户与记录关联

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | INT, 外键 → users.id | 用户 ID |
| record_id | INT, 外键 → records.id | 记录 ID |

联合主键 `(user_id, record_id)`，记录删除时级联删除。

### daily_logs — 每日记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, 自增主键 | 记录 ID |
| user_id | INT, 外键 → users.id | 用户 ID |
| log_date | DATE | 记录日期 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

联合唯一键 `(user_id, log_date)`，每个用户每天只能有一条记录。

### daily_todos — 待办事项

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, 自增主键 | 待办 ID |
| daily_log_id | INT, 外键 → daily_logs.id | 关联每日记录 |
| content | VARCHAR(500) | 待办内容 |
| is_done | TINYINT(1) | 是否完成（0/1） |
| sort_order | INT | 排序序号 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## API 接口

### 认证（无需 token）

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | `{ username, password }` |
| POST | /api/auth/login | 登录 | `{ username, password }`，返回 `{ token, username }` |

### 记录与统计（需在 Header 中携带 `Authorization: Bearer <token>`）

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | /api/records | 获取当前用户的记录 | `?month=2026-05` (可选) |
| POST | /api/records | 新增记录 | `{ type, amount, category, note, date }` |
| DELETE | /api/records/:id | 删除记录 | - |
| GET | /api/stats | 月度统计 | `?month=2026-05` (必填) |

### 每日记录（需 token）

| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | /api/daily-logs/graph | 获取一年的贡献图数据 | `?year=2026` (可选，默认当前年) |
| GET | /api/daily-logs/:date | 获取指定日期的待办列表 | 日期格式 YYYY-MM-DD |
| POST | /api/daily-logs/:date/todos | 新增待办 | `{ content }` |
| PUT | /api/daily-logs/todos/:id | 编辑待办 | `{ content, is_done }` (均可选) |
| DELETE | /api/daily-logs/todos/:id | 删除待办 | - |
