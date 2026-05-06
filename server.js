const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lms_quiz'
});

// LOGIN (TANPA HASH)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username=? AND password=?',
    [username, password],
    (err, result) => {
      if (result.length > 0) res.json(result[0]);
      else res.status(401).json({ message: 'Login gagal' });
    }
  );
});

// GET RANDOM SOAL
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions ORDER BY RAND()', (err, result) => {
    res.json(result);
  });
});

// GET ALL SOAL (ADMIN)
app.get('/all-questions', (req, res) => {
  db.query('SELECT * FROM questions', (err, result) => {
    res.json(result);
  });
});

// TAMBAH SOAL
app.post('/add-question', (req, res) => {
  const { question, a, b, c, d, answer } = req.body;

  db.query(
    'INSERT INTO questions (question,a,b,c,d,answer) VALUES (?,?,?,?,?,?)',
    [question, a, b, c, d, answer],
    () => res.json({ message: 'Soal ditambahkan' })
  );
});

// UPDATE SOAL
app.post('/update-question', (req, res) => {
  const { id, question, a, b, c, d, answer } = req.body;

  db.query(
    'UPDATE questions SET question=?, a=?, b=?, c=?, d=?, answer=? WHERE id=?',
    [question, a, b, c, d, answer, id],
    () => res.json({ message: 'Soal diupdate' })
  );
});

// HAPUS SOAL
app.post('/delete-question', (req, res) => {
  const { id } = req.body;

  db.query(
    'DELETE FROM questions WHERE id=?',
    [id],
    () => res.json({ message: 'Soal dihapus' })
  );
});

// SUBMIT NILAI
app.post('/submit', (req, res) => {
  const { user_id, score } = req.body;

  db.query(
    'INSERT INTO results (user_id, score) VALUES (?, ?)',
    [user_id, score],
    () => res.json({ message: 'Nilai tersimpan' })
  );
});

// HASIL + DATA CHART
app.get('/results', (req, res) => {
  db.query(
    'SELECT users.username, results.score FROM results JOIN users ON users.id = results.user_id',
    (err, result) => res.json(result)
  );
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
