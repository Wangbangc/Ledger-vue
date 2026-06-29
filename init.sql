CREATE DATABASE IF NOT EXISTS bookkeeping DEFAULT CHARACTER SET utf8mb4;
USE bookkeeping;

CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  note VARCHAR(200) DEFAULT '',
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户-记录关联表
CREATE TABLE IF NOT EXISTS user_records (
  user_id INT NOT NULL,
  record_id INT NOT NULL,
  PRIMARY KEY (user_id, record_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

INSERT INTO records (type, amount, category, note, date) VALUES
('expense', 35.50, '餐饮', '午餐', '2026-05-28'),
('expense', 120.00, '交通', '打车', '2026-05-28'),
('income', 8000.00, '工资', '5月工资', '2026-05-25'),
('expense', 299.00, '购物', '耳机', '2026-05-20'),
('expense', 45.00, '餐饮', '聚餐', '2026-05-18');

-- 每日记录主表
CREATE TABLE IF NOT EXISTS daily_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, log_date)
);

-- 待办事项表
CREATE TABLE IF NOT EXISTS daily_todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  daily_log_id INT NOT NULL,
  content VARCHAR(500) NOT NULL DEFAULT '',
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE
);

-- 习惯表
CREATE TABLE IF NOT EXISTS habits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  total_days INT NOT NULL,
  schedule VARCHAR(20) NOT NULL COMMENT '执行日，逗号分隔，0=周日 1=周一 ... 6=周六',
  start_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
