const express = require('express');
const router = express.Router();
const statsRouter = express.Router();
const pool = require('../db');

// 获取记录列表（仅当前用户）
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    let sql = `SELECT r.* FROM records r
               INNER JOIN user_records ur ON r.id = ur.record_id
               WHERE ur.user_id = ?`;
    const params = [req.userId];

    if (month) {
      sql += ' AND DATE_FORMAT(r.date, "%Y-%m") = ?';
      params.push(month);
    }

    sql += ' ORDER BY r.date DESC, r.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增记录（关联当前用户）
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO records (type, amount, category, note, date) VALUES (?, ?, ?, ?, ?)',
      [type, amount, category, note || '', date]
    );
    await pool.query(
      'INSERT INTO user_records (user_id, record_id) VALUES (?, ?)',
      [req.userId, result.insertId]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除记录（仅限自己的记录）
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM user_records WHERE user_id = ? AND record_id = ?',
      [req.userId, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: '无权删除此记录' });
    }
    await pool.query('DELETE FROM records WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 月度统计（仅当前用户）
statsRouter.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: '请提供 month 参数' });

    const [summary] = await pool.query(
      `SELECT r.type, SUM(r.amount) as total FROM records r
       INNER JOIN user_records ur ON r.id = ur.record_id
       WHERE ur.user_id = ? AND DATE_FORMAT(r.date, "%Y-%m") = ?
       GROUP BY r.type`,
      [req.userId, month]
    );

    const [categories] = await pool.query(
      `SELECT r.category, r.type, SUM(r.amount) as total FROM records r
       INNER JOIN user_records ur ON r.id = ur.record_id
       WHERE ur.user_id = ? AND DATE_FORMAT(r.date, "%Y-%m") = ?
       GROUP BY r.category, r.type ORDER BY total DESC`,
      [req.userId, month]
    );

    const income = summary.find(r => r.type === 'income')?.total || 0;
    const expense = summary.find(r => r.type === 'expense')?.total || 0;

    res.json({ income, expense, balance: income - expense, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, statsRouter };
