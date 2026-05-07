// ===========================
// API CONNECTOR — ILG SmartTest
// Ganti BASE_URL dengan IP/domain VPS kamu
// ===========================

const API_BASE = 'https://smart.infotama.net.id/api'; // ← GANTI INI

const API = {

  // Tambahkan di dalam object API, sebelum getToken()
  _normalize(data) {
    if (Array.isArray(data)) return data.map(d => this._normalize(d));
    if (!data || typeof data !== 'object') return data;
  
    const map = {
      time_limit:     'timeLimit',
      passing_score:  'passingScore',
      question_text:  'text',
      option_text:    'text',
      user_id:        'userId',
      quiz_id:        'quizId',
      correct_count:  'correctCount',
      wrong_count:    'wrongCount',
      skipped_count:  'skippedCount',
      time_used:      'timeUsed',
      created_at:     'date',
      is_correct:     'isCorrect',
      option_order:   'optionOrder',
    };
  
    const result = {};
    for (const [key, val] of Object.entries(data)) {
      const newKey = map[key] || key;
      result[newKey] = this._normalize(val);
    }
    return result;
  },
  
  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return this._normalize(data);  // ✅ normalize di sini
  },
  // ---- TOKEN ----
  getToken() { return localStorage.getItem('token'); },
  setToken(t) { localStorage.setItem('token', t); },
  clearToken() { localStorage.removeItem('token'); },

  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    };
  },

  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return data;
  },

  // ---- AUTH ----
  async login(email, password) {
    const data = await this.request('POST', '/login', { email, password });
    this.setToken(data.token);
    return data.user;
  },

  logout() { this.clearToken(); },

  // ---- USERS ----
  async getUsers()            { return this.request('GET', '/users'); },
  async addUser(user)         { return this.request('POST', '/users', user); },
  async deleteUser(id)        { return this.request('DELETE', `/users/${id}`); },

  // ---- QUIZZES ----
  async getQuizzes()          { return this.request('GET', '/quizzes'); },
  async addQuiz(quiz)         { return this.request('POST', '/quizzes', quiz); },
  async deleteQuiz(id)        { return this.request('DELETE', `/quizzes/${id}`); },

  // ---- QUESTIONS ----
  async addQuestion(quizId, q)    { return this.request('POST', `/quizzes/${quizId}/questions`, q); },
  async editQuestion(id, q)       { return this.request('PUT', `/questions/${id}`, q); },
  async deleteQuestion(id)        { return this.request('DELETE', `/questions/${id}`); },

  // ---- ASSIGNMENTS ----
  async toggleAssign(quizId, userId, assign) {
    return this.request('POST', `/quizzes/${quizId}/assign`, { userId, assign });
  },

  // ---- RESULTS ----
  async getResults()          { return this.request('GET', '/results'); },
  async getMyResults()        { return this.request('GET', '/results/me'); },
  async submitResult(result)  { return this.request('POST', '/results', result); },
};
