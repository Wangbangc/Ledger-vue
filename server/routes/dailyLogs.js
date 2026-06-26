const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/daily-logs/graph?year=2025 - 获取一年的贡献图数据
router.get('/graph', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const [logs] = await pool.query(
      `SELECT dl.log_date, COUNT(dt.id) AS total,
              SUM(dt.is_done) AS done
       FROM daily_logs dl
       LEFT JOIN daily_todos dt ON dl.id = dt.daily_log_id
       WHERE dl.user_id = ? AND dl.log_date BETWEEN ? AND ?
       GROUP BY dl.log_date`,
      [req.userId, startDate, endDate]
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/daily-logs/:date - 获取指定日期的待办列表
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    let [logs] = await pool.query(
      'SELECT id FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [req.userId, date]
    );

    let logId;
    if (logs.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO daily_logs (user_id, log_date) VALUES (?, ?)',
        [req.userId, date]
      );
      logId = result.insertId;
    } else {
      logId = logs[0].id;
    }

    const [todos] = await pool.query(
      'SELECT * FROM daily_todos WHERE daily_log_id = ? ORDER BY sort_order ASC, created_at ASC',
      [logId]
    );

    res.json({ logId, date, todos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/daily-logs/:date/todos - 新增待办
router.post('/:date/todos', async (req, res) => {
  try {
    const { date } = req.params;
    const { content } = req.body;

    let [logs] = await pool.query(
      'SELECT id FROM daily_logs WHERE user_id = ? AND log_date = ?',
      [req.userId, date]
    );

    let logId;
    if (logs.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO daily_logs (user_id, log_date) VALUES (?, ?)',
        [req.userId, date]
      );
      logId = result.insertId;
    } else {
      logId = logs[0].id;
    }

    const [maxOrder] = await pool.query(
      'SELECT MAX(sort_order) AS max_order FROM daily_todos WHERE daily_log_id = ?',
      [logId]
    );
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    const [result] = await pool.query(
      'INSERT INTO daily_todos (daily_log_id, content, sort_order) VALUES (?, ?, ?)',
      [logId, content, nextOrder]
    );

    res.json({ id: result.insertId, daily_log_id: logId, content, is_done: 0, sort_order: nextOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/daily-logs/todos/:id - 编辑待办
router.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_done } = req.body;

    const [rows] = await pool.query(
      `SELECT dt.id FROM daily_todos dt
       INNER JOIN daily_logs dl ON dt.daily_log_id = dl.id
       WHERE dt.id = ? AND dl.user_id = ?`,
      [id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: '无权修改此待办' });
    }

    const fields = [];
    const values = [];
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (is_done !== undefined) { fields.push('is_done = ?'); values.push(is_done); }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE daily_todos SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const [updated] = await pool.query('SELECT * FROM daily_todos WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/daily-logs/todos/:id - 删除待办
router.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT dt.id FROM daily_todos dt
       INNER JOIN daily_logs dl ON dt.daily_log_id = dl.id
       WHERE dt.id = ? AND dl.user_id = ?`,
      [id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: '无权删除此待办' });
    }

    await pool.query('DELETE FROM daily_todos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
