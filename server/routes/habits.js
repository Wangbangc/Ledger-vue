const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Helper: format a Date object as "YYYY-MM-DD"
 */
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Compute execution dates for a habit.
 * Walk from start_date forward, pick days whose weekday is in schedule,
 * collect exactly total_days dates.
 */
function computeExecutionDates(startDateStr, schedule, totalDays) {
  const allowed = schedule.split(',').map(Number);
  const dates = [];
  const d = new Date(startDateStr + 'T00:00:00');
  while (dates.length < totalDays) {
    if (allowed.includes(d.getDay())) {
      dates.push(formatDate(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// GET /api/habits - list all habits with progress info
router.get('/', async (req, res) => {
  try {
    const [habits] = await pool.query(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    const results = [];

    for (const habit of habits) {
      const execDates = computeExecutionDates(
        habit.start_date,
        habit.schedule,
        habit.total_days
      );

      // Count completed days and find last done date
      if (execDates.length === 0) {
        results.push({
          ...habit,
          completed_days: 0,
          streak: 0,
          last_done_date: null,
        });
        continue;
      }

      const placeholders = execDates.map(() => '?').join(',');
      const [rows] = await pool.query(
        `SELECT dl.log_date,
                SUM(CASE WHEN dt.is_done = 1 THEN 1 ELSE 0 END) AS done_count
         FROM daily_logs dl
         LEFT JOIN daily_todos dt ON dl.id = dt.daily_log_id AND dt.content = ?
         WHERE dl.user_id = ? AND dl.log_date IN (${placeholders})
         GROUP BY dl.log_date
         HAVING done_count > 0`,
        [habit.name, req.userId, ...execDates]
      );

      const completedDates = new Set(rows.map(r => r.log_date));
      const completedDays = completedDates.size;

      // Calculate streak: walk backward from today through execution dates
      const today = formatDate(new Date());
      const pastExecDates = execDates.filter(d => d <= today);
      let streak = 0;
      for (let i = pastExecDates.length - 1; i >= 0; i--) {
        if (completedDates.has(pastExecDates[i])) {
          streak++;
        } else {
          break;
        }
      }

      const lastDoneDate =
        completedDates.size > 0
          ? [...completedDates].sort().pop()
          : null;

      results.push({
        ...habit,
        completed_days: completedDays,
        streak,
        last_done_date: lastDoneDate,
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/habits - create a habit and batch-generate todos
router.post('/', async (req, res) => {
  try {
    const { name, total_days, schedule, start_date } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name 不能为空' });
    }
    if (!Number.isInteger(total_days) || total_days < 1 || total_days > 365) {
      return res.status(400).json({ error: 'total_days 必须为 1-365 的整数' });
    }
    if (!/^[0-6](,[0-6])*$/.test(schedule)) {
      return res.status(400).json({ error: 'schedule 格式不正确，应为逗号分隔的 0-6 数字' });
    }
    if (!start_date) {
      return res.status(400).json({ error: 'start_date 不能为空' });
    }

    // Insert habit
    const [result] = await pool.query(
      'INSERT INTO habits (user_id, name, total_days, schedule, start_date) VALUES (?, ?, ?, ?, ?)',
      [req.userId, name.trim(), total_days, schedule, start_date]
    );
    const habitId = result.insertId;

    // Compute execution dates and batch-generate todos
    const execDates = computeExecutionDates(start_date, schedule, total_days);
    let insertedCount = 0;

    for (const date of execDates) {
      // Ensure daily_logs row exists
      let [logs] = await pool.query(
        'SELECT id FROM daily_logs WHERE user_id = ? AND log_date = ?',
        [req.userId, date]
      );

      let logId;
      if (logs.length === 0) {
        const [logResult] = await pool.query(
          'INSERT INTO daily_logs (user_id, log_date) VALUES (?, ?)',
          [req.userId, date]
        );
        logId = logResult.insertId;
      } else {
        logId = logs[0].id;
      }

      // Get next sort_order
      const [maxOrder] = await pool.query(
        'SELECT MAX(sort_order) AS max_order FROM daily_todos WHERE daily_log_id = ?',
        [logId]
      );
      const nextOrder = (maxOrder[0].max_order || 0) + 1;

      // Insert daily_todo
      await pool.query(
        'INSERT INTO daily_todos (daily_log_id, content, sort_order) VALUES (?, ?, ?)',
        [logId, name.trim(), nextOrder]
      );
      insertedCount++;
    }

    const [habit] = await pool.query('SELECT * FROM habits WHERE id = ?', [habitId]);
    res.json({ ...habit[0], inserted_count: insertedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/habits/:id - delete a habit (does NOT delete generated todos)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id FROM habits WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: '无权删除此习惯' });
    }

    await pool.query('DELETE FROM habits WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
