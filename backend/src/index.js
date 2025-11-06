require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');
const attachmentRoutes = require('./routes/attachments');
const verifyToken = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.email}, you have accessed a protected route!`,
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'OpsLog API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));