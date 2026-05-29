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
