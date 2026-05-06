const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Ganti dengan URL GitHub Pages kamu nanti
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// =====================
// DATABASE CONNECTION
// =====================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ilg_smarttest',
  waitForConnections: true,
  connectionLimit: 10,
});

// =====================
// MIDDLEWARE AUTH
// =====================
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'ilg_secret_key');
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
  next();
}

// =====================
// AUTH ROUTES
// =====================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email tidak ditemukan' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Password salah' });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, avatar: user.avatar },
      process.env.JWT_SECRET || 'ilg_secret_key',
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// USER ROUTES
// =====================
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, department, avatar FROM users WHERE role = "employee"');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  try {
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar' });
    const hashed = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, avatar) VALUES (?, ?, ?, "employee", ?, ?)',
      [name, email, hashed, department, avatar]
    );
    res.json({ id: result.insertId, name, email, role: 'employee', department, avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM results WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM quiz_assignments WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// QUIZ ROUTES
// =====================
app.get('/api/quizzes', authMiddleware, async (req, res) => {
  try {
    const [quizzes] = await pool.query('SELECT * FROM quizzes');
    for (const quiz of quizzes) {
      const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [quiz.id]);
      for (const q of questions) {
        const [options] = await pool.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
        q.options = options.map(o => o.option_text);
        q.correct = options.findIndex(o => o.is_correct);
      }
      quiz.questions = questions;
      const [assignments] = await pool.query('SELECT user_id FROM quiz_assignments WHERE quiz_id = ?', [quiz.id]);
      quiz.assignedTo = assignments.map(a => a.user_id);
    }
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quizzes', authMiddleware, adminOnly, async (req, res) => {
  const { title, description, icon, category, timeLimit, passingScore } = req.body;
  if (!title || !description || !category || !timeLimit || !passingScore)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  try {
    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, icon, category, time_limit, passing_score) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, icon || '📋', category, timeLimit, passingScore]
    );
    res.json({ id: result.insertId, title, description, icon, category, timeLimit, passingScore, questions: [], assignedTo: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quizzes/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    const [questions] = await pool.query('SELECT id FROM questions WHERE quiz_id = ?', [id]);
    for (const q of questions) {
      await pool.query('DELETE FROM options WHERE question_id = ?', [q.id]);
    }
    await pool.query('DELETE FROM questions WHERE quiz_id = ?', [id]);
    await pool.query('DELETE FROM results WHERE quiz_id = ?', [id]);
    await pool.query('DELETE FROM quiz_assignments WHERE quiz_id = ?', [id]);
    await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// QUESTION ROUTES
// =====================
app.post('/api/quizzes/:quizId/questions', authMiddleware, adminOnly, async (req, res) => {
  const { quizId } = req.params;
  const { text, options, correct } = req.body;
  if (!text || !options || options.length !== 4 || correct === undefined)
    return res.status(400).json({ error: 'Data soal tidak lengkap' });
  try {
    const [result] = await pool.query('INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)', [quizId, text]);
    const questionId = result.insertId;
    for (let i = 0; i < options.length; i++) {
      await pool.query(
        'INSERT INTO options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
        [questionId, options[i], i === correct ? 1 : 0, i]
      );
    }
    res.json({ id: questionId, text, options, correct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/questions/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { text, options, correct } = req.body;
  try {
    await pool.query('UPDATE questions SET question_text = ? WHERE id = ?', [text, id]);
    await pool.query('DELETE FROM options WHERE question_id = ?', [id]);
    for (let i = 0; i < options.length; i++) {
      await pool.query(
        'INSERT INTO options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
        [id, options[i], i === correct ? 1 : 0, i]
      );
    }
    res.json({ id, text, options, correct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM options WHERE question_id = ?', [id]);
    await pool.query('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// ASSIGNMENT ROUTES
// =====================
app.post('/api/quizzes/:quizId/assign', authMiddleware, adminOnly, async (req, res) => {
  const { quizId } = req.params;
  const { userId, assign } = req.body;
  try {
    if (assign) {
      await pool.query(
        'INSERT IGNORE INTO quiz_assignments (quiz_id, user_id) VALUES (?, ?)',
        [quizId, userId]
      );
    } else {
      await pool.query('DELETE FROM quiz_assignments WHERE quiz_id = ? AND user_id = ?', [quizId, userId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// RESULT ROUTES
// =====================
app.get('/api/results', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM results ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/results/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/results', authMiddleware, async (req, res) => {
  const { quizId, score, correctCount, wrongCount, skippedCount, passed, timeUsed } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO results (user_id, quiz_id, score, correct_count, wrong_count, skipped_count, passed, time_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, quizId, score, correctCount, wrongCount, skippedCount, passed ? 1 : 0, timeUsed]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server berjalan di port ${PORT}`));
