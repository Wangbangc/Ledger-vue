const jwt = require('jsonwebtoken');

const SECRET = 'bookkeeping_secret_key_2026';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: '登录已过期' });
  }
}

module.exports = { authMiddleware, SECRET };
