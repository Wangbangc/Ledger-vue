# 记账本 (Bookkeeping)

个人记账应用，支持用户注册登录，每人独立管理自己的收支记录。前端 Vue 3 + Vite + Element Plus，后端 Express + MySQL。

## 项目结构

```
demo/
├── client/              # 前端 (Vue 3 + Vite + Element Plus)
│   ├── src/
│   │   ├── api.js              # Axios 封装 + token 拦截器
│   │   ├── main.js             # 入口，注册 Element Plus / Router
│   │   ├── App.vue             # 根组件（导航栏 + router-view）
│   │   ├── router/
│   │   │   └── index.js        # 路由配置 + 登录守卫
│   │   ├── views/
│   │   │   ├── Home.vue        # 主页面（记账列表 + 统计）
│   │   │   ├── Login.vue       # 登录页
│   │   │   └── Register.vue    # 注册页
│   │   └── components/
│   │       ├── MonthlyStats.vue  # 月度统计卡片
│   │       ├── RecordForm.vue    # 新增记录表单
│   │       └── RecordList.vue    # 记录列表
│   └── package.json
├── server/              # 后端 (Express + MySQL2)
│   ├── app.js                # 入口，挂载路由与中间件
│   ├── db.js                 # MySQL 连接池
│   ├── middleware/
│   │   └── auth.js           # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.js           # 注册 / 登录路由
│   │   └── records.js        # 记录 CRUD + 月度统计
│   └── package.json
└── init.sql             # 数据库初始化脚本
```

## 环境要求

- Node.js >= 16
- MySQL >= 5.7

## 启动步骤

### 1. 初始化数据库

执行初始化脚本创建数据库和三张表（`records`、`users`、`user_records`）：

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
