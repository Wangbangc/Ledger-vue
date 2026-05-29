const express = require('express');
const cors = require('cors');
const { router, statsRouter } = require('./routes/records');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/records', authMiddleware, router);
app.use('/api/stats', authMiddleware, statsRouter);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
