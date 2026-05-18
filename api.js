const API_BASE = 'https://smart.infotama.net.id/api';
const API = {

  // ---- HELPERS ----
  _normalize(data) {},

  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('ilg_token')}`
    };
  },

  // Satu request saja, dengan _normalize
  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
    return this._normalize(data); // ✅ pakai normalize
  },

  // Shortcut yang hilang — ini penyebab error!
  _get(path)         { return this.request('GET', path); },
  _post(path, body)  { return this.request('POST', path, body); },

  // ---- TOKEN ----
  getToken()   { return localStorage.getItem('ilg_token'); },
  setToken(t)  { localStorage.setItem('ilg_token', t); },
  clearToken() { localStorage.removeItem('ilg_token'); },

  // ---- AUTH ----
  async checkSession() {
    if (!this.getToken()) return null;
    try {
      return await this._get('/me');
    } catch {
      this.clearToken();
      return null;
    }
  },

  async login(email, password) {
    const data = await this._post('/login', { email, password });
    this.setToken(data.token);
    return data.user;
  },

  logout() { this.clearToken(); },

  // ---- USERS ----
  async getUsers()        { return this.request('GET', '/users'); },
  async addUser(user)     { return this.request('POST', '/users', user); },
  async deleteUser(id)    { return this.request('DELETE', `/users/${id}`); },

  // ---- QUIZZES ----
  async getQuizzes()      { return this.request('GET', '/quizzes'); },
  async addQuiz(quiz)     { return this.request('POST', '/quizzes', quiz); },
  async deleteQuiz(id)    { return this.request('DELETE', `/quizzes/${id}`); },

  // ---- QUESTIONS ----
  async addQuestion(quizId, q)  { return this.request('POST', `/quizzes/${quizId}/questions`, q); },
  async editQuestion(id, q)     { return this.request('PUT', `/questions/${id}`, q); },
  async deleteQuestion(id)      { return this.request('DELETE', `/questions/${id}`); },

  // ---- ASSIGNMENTS ----
  async toggleAssign(quizId, userId, assign) {
    return this.request('POST', `/quizzes/${quizId}/assign`, { userId, assign });
  },

  // ---- RESULTS ----
  async getResults()         { return this.request('GET', '/results'); },
  async getMyResults()       { return this.request('GET', '/results/me'); },
  async submitResult(result) { return this.request('POST', '/results', result); },
};
