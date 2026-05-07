// ===========================
// APP CONTROLLER — EduTest LMS
// ===========================

const App = {
  currentPage: 'login',
  activeQuiz: null,

  init() { this.render(); },

  navigate(page, data) {
    this.currentPage = page;
    if (data) this._pageData = data;
    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    const app = document.getElementById('app');
    if (!Auth.isLoggedIn()) {
      app.innerHTML = this._loginPage();
      return;
    }

    const isAdmin = Auth.isAdmin();

    if (this.currentPage === 'quiz-take') {
      app.innerHTML = this._quizTakePage();
      this._initQuiz();
      return;
    }

    if (this.currentPage === 'quiz-result') {
      app.innerHTML = this._resultPage(this._pageData);
      return;
    }

    app.innerHTML = `
      <div class="layout">
        ${this._sidebar(isAdmin)}
        <div class="main-content" id="main-content">
          <div class="page-loading">Memuat...</div>
        </div>
      </div>`;

    this._loadPageContent(isAdmin);
  },

  async _loadPageContent(isAdmin) {
    const el = document.getElementById('main-content');
    if (!el) return;
    try {
      let html = '';
      const pg = this.currentPage;
      if (isAdmin) {
        if (pg === 'dashboard') html = AdminViews.dashboard();
        else if (pg === 'employees') html = AdminViews.employees();
        else if (pg === 'quizzes') html = AdminViews.quizzes();
        else if (pg === 'results') html = AdminViews.results();
      } else {
        if (pg === 'dashboard') html = await this._employeeDashboard();
        else if (pg === 'my-quizzes') html = await this._employeeQuizzes();
        else if (pg === 'my-results') html = await this._employeeResults();
      }
      el.innerHTML = html || '<div class="page-body"><p>Halaman tidak ditemukan.</p></div>';
    } catch (err) {
      el.innerHTML = `<div class="page-body"><p style="color:var(--red);">Gagal memuat halaman: ${err.message}</p></div>`;
    }
  },

  // ===== SIDEBAR =====
  _sidebar(isAdmin) {
    const u = Auth.currentUser;
    const pg = this.currentPage;

    const adminNav = `
      <div class="sidebar-section-label">Utama</div>
      <div class="nav-item ${pg==='dashboard'?'active':''}" onclick="App.navigate('dashboard')">
        <span class="icon">📊</span> Dashboard
      </div>
      <div class="nav-item ${pg==='employees'?'active':''}" onclick="App.navigate('employees')">
        <span class="icon">👥</span> Karyawan
        <span class="count">${DB.users.filter(u=>u.role==='employee').length}</span>
      </div>
      <div class="sidebar-section-label">Konten</div>
      <div class="nav-item ${pg==='quizzes'?'active':''}" onclick="App.navigate('quizzes')">
        <span class="icon">📋</span> Manajemen Kuis
      </div>
      <div class="nav-item ${pg==='results'?'active':''}" onclick="App.navigate('results')">
        <span class="icon">🏆</span> Hasil Tes
      </div>`;

    const employeeNav = `
      <div class="sidebar-section-label">Menu</div>
      <div class="nav-item ${pg==='dashboard'?'active':''}" onclick="App.navigate('dashboard')">
        <span class="icon">🏠</span> Beranda
      </div>
      <div class="nav-item ${pg==='my-quizzes'?'active':''}" onclick="App.navigate('my-quizzes')">
        <span class="icon">📝</span> Kuis Saya
      </div>
      <div class="nav-item ${pg==='my-results'?'active':''}" onclick="App.navigate('my-results')">
        <span class="icon">📈</span> Hasil Saya
      </div>`;

    return `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <img src="logoilg.jpeg" alt="logo" style="width:32px; height:32px; object-fit:contain;">
        </div>
        <span>ILG SmartTest</span>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${u.avatar}</div>
        <div class="sidebar-user-info">
          <div class="name">${u.name}</div>
          <div class="role">${isAdmin ? 'Administrator' : u.department}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${isAdmin ? adminNav : employeeNav}
      </nav>
      <div class="sidebar-footer">
        <div class="logout-btn" onclick="App.logout()">
          <span>🚪</span> Keluar
        </div>
      </div>
    </aside>`;
  },

  // ===== LOGIN PAGE =====
  _loginPage() {
    return `
    <div class="login-page">
      <div class="login-wrap">
        <div class="login-hero">
          <div class="login-hero-logo">
            <div class="login-hero-logo-icon">
              <img src="logoilg.jpeg" alt="logo" style="width:32px; height:32px; object-fit:contain;">
            </div>
            <span>ILG SmartTest</span>
          </div>
          <div class="login-hero-content">
            <h2>Platform Evaluasi <span>Karyawan</span> Modern</h2>
            <p>Sistem manajemen kuis dan tes terintegrasi untuk mengukur kompetensi karyawan secara efisien dan akurat.</p>
          </div>
          <div class="login-hero-stats">
            <div class="login-stat-item"><div class="val">3</div><div class="lbl">Kuis Aktif</div></div>
            <div class="login-stat-item"><div class="val">5</div><div class="lbl">Karyawan</div></div>
            <div class="login-stat-item"><div class="val">100%</div><div class="lbl">Digital</div></div>
          </div>
        </div>
        <div class="login-form-wrap">
          <h3>Masuk ke Akun</h3>
          <p>Gunakan kredensial yang diberikan oleh Admin HR Anda.</p>

          <div class="demo-accounts">
            <h4>Akun Demo</h4>
            <div class="demo-row" onclick="App.fillLogin('dwi@infotama.net.id','admin123')">
              <div class="demo-row-info">
                <span class="name">Dwi Putro Bagus Sugianto</span>
                <span class="creds">dwi@infotama.net.id / admin123</span>
              </div>
              <span class="badge badge-accent">Admin</span>
            </div>
            <div class="demo-row" onclick="App.fillLogin('sevti@infotama.net.id','sevti123')">
              <div class="demo-row-info">
                <span class="name">Sevti Ariyani</span>
                <span class="creds">sevti@infotama.net.id / sevti123</span>
              </div>
              <span class="badge badge-muted">HR</span>
            </div>
            <div class="demo-row" onclick="App.fillLogin('dhika@infotama.net.id','karyawan123')">
              <div class="demo-row-info">
                <span class="name">Dhika</span>
                <span class="creds">dhika@infotama.net.id / karyawan123</span>
              </div>
              <span class="badge badge-muted">NOC</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="login-email" type="email" placeholder="email@perusahaan.com"/>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" id="login-password" type="password" placeholder="••••••••"
              onkeydown="if(event.key==='Enter')App.doLogin()"/>
          </div>
          <div id="login-error" style="color:var(--red);font-size:0.85rem;margin-bottom:12px;display:none;"></div>
          <button class="btn btn-primary btn-full btn-lg" onclick="App.doLogin()">Masuk →</button>
        </div>
      </div>
    </div>`;
  },

  fillLogin(email, pass) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = pass;
  },

  async doLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    err.style.display = 'none';
  
    try {
      const user = await API.login(email, password);
      Auth.currentUser = user;
  
      // ✅ Load data dari API setelah login
      await this.loadData();
  
      this.currentPage = 'dashboard';
      this.render();
    } catch (e) {
      err.textContent = e.message || 'Email atau password salah';
      err.style.display = 'block';
    }
  },
  
  // ✅ Fungsi baru — fetch semua data dari API ke DB lokal
  async loadData() {
    try {
      const [users, quizzes] = await Promise.all([
        API.getUsers(),
        API.getQuizzes()
      ]);
  
      // Gabung: admin dari DB lokal + employee dari API
      const admins = DB.users.filter(u => u.role === 'admin');
      DB.users = [...admins, ...users];
      DB.quizzes = quizzes;
  
      // Load results kalau admin
      if (Auth.currentUser?.role === 'admin') {
        DB.results = await API.getResults();
      }
    } catch (e) {
      console.error('Gagal load data dari API:', e.message);
    }
  },

    async navigate(page, data) {
    this.currentPage = page;
    if (data) this._pageData = data;
  
    // ✅ Refresh data setiap pindah halaman admin
    if (Auth.isAdmin()) await this.loadData();
  
    this.render();
    window.scrollTo(0, 0);
  },

  logout() {
    Auth.logout();
    QuizEngine.stopTimer();
    this.currentPage = 'login';
    this.render();
  },

  // ===== EMPLOYEE VIEWS =====
  async _employeeDashboard() {
    const u = Auth.currentUser;
    let assigned = [];
    let results = [];

    try {
      assigned = await API.getQuizzes();
      results = await API.getMyResults();
    } catch(e) {
      // fallback ke DB lokal kalau API belum konek
      assigned = DB.getAssignedQuizzes(u.id);
      results = DB.getUserResults(u.id);
    }

    const done = results.length;
    const passed = results.filter(r => r.passed).length;
    const avg = done ? Math.round(results.reduce((s,r) => s+r.score,0) / done) : 0;
    const completedIds = results.map(r => r.quizId || r.quiz_id);
    const pending = assigned.filter(q => !completedIds.includes(q.id)).length;

    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Halo, ${u.name.split(' ')[0]}! 👋</h1>
        <p>Semangat belajar hari ini. Berikut ringkasan perkembangan Anda.</p>
      </div>
      <span class="badge badge-muted">${u.department}</span>
    </div>
    <div class="page-body">
      <div class="stats-grid">
        <div class="stat-card accent">
          <div class="stat-icon accent">📋</div>
          <div class="stat-value">${assigned.length}</div>
          <div class="stat-label">Kuis Ditugaskan</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon amber">⏳</div>
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Belum Dikerjakan</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon green">✅</div>
          <div class="stat-value">${passed}</div>
          <div class="stat-label">Kuis Lulus</div>
        </div>
        <div class="stat-card ${avg >= 70 ? 'green' : 'red'}">
          <div class="stat-icon ${avg >= 70 ? 'green' : 'red'}">🎯</div>
          <div class="stat-value">${avg}%</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>

      ${pending > 0 ? `
        <div style="background:linear-gradient(135deg,rgba(108,99,255,0.15),rgba(0,229,160,0.08));border:1px solid var(--accent-dim);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;gap:16px;">
          <span style="font-size:2rem;">📌</span>
          <div>
            <div style="font-weight:700;margin-bottom:4px;">Ada ${pending} kuis yang menunggu!</div>
            <div style="color:var(--text-secondary);font-size:0.88rem;">Segera selesaikan tes yang telah ditugaskan oleh Admin.</div>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-left:auto;" onclick="App.navigate('my-quizzes')">Kerjakan →</button>
        </div>` : ''}

      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">Kuis Tersedia</h3>
      <div class="quiz-grid">
        ${assigned.length === 0
          ? '<div class="empty-state"><div class="empty-icon">📭</div><h3>Belum ada kuis</h3><p>Admin belum menugaskan kuis untuk Anda.</p></div>'
          : assigned.slice(0,3).map(q => this._employeeQuizCard(q, results)).join('')}
      </div>
    </div>`;
  },

  _employeeQuizCard(q, results = []) {
    const completedIds = results.map(r => r.quizId || r.quiz_id);
    const result = results.find(r => (r.quizId || r.quiz_id) === q.id);
    const done = !!result;
    return `
    <div class="quiz-card" onclick="App.navigate('my-quizzes')">
      <div class="quiz-card-header">
        <div class="quiz-card-icon">${q.icon}</div>
        ${done
          ? `<span class="badge ${result.passed ? 'badge-green' : 'badge-red'}">${result.score}%</span>`
          : '<span class="badge badge-amber">Belum Dikerjakan</span>'}
      </div>
      <div class="quiz-card-title">${q.title}</div>
      <div class="quiz-card-desc">${q.description}</div>
      <div class="quiz-card-meta">
        <div class="quiz-meta-item">
          <span class="meta-val">${q.questions ? q.questions.length : 0}</span>
          <span class="meta-lbl">Soal</span>
        </div>
        <div class="quiz-meta-item">
          <span class="meta-val">${q.timeLimit || q.time_limit}m</span>
          <span class="meta-lbl">Waktu</span>
        </div>
        <div class="quiz-meta-item">
          <span class="meta-val">${q.passingScore || q.passing_score}%</span>
          <span class="meta-lbl">Min. Lulus</span>
        </div>
      </div>
    </div>`;
  },

  async _employeeQuizzes() {
    const userId = Auth.currentUser.id;
    let assigned = [];
    let results = [];

    try {
      assigned = await API.getQuizzes();
      results = await API.getMyResults();
    } catch(e) {
      assigned = DB.getAssignedQuizzes(userId);
      results = DB.getUserResults(userId);
    }

    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Kuis Saya</h1>
        <p>${assigned.length} kuis ditugaskan untuk Anda.</p>
      </div>
    </div>
    <div class="page-body">
      ${assigned.length === 0
        ? '<div class="empty-state"><div class="empty-icon">📭</div><h3>Belum ada kuis</h3><p>Admin belum menugaskan kuis untuk Anda.</p></div>'
        : `<div class="quiz-grid">${assigned.map(q => {
            const result = results.find(r => (r.quizId || r.quiz_id) === q.id);
            const done = !!result;
            return `
            <div class="quiz-card">
              <div class="quiz-card-header">
                <div class="quiz-card-icon">${q.icon}</div>
                ${done
                  ? `<span class="badge ${result.passed ? 'badge-green' : 'badge-red'}">${result.passed ? 'Lulus' : 'Tidak Lulus'}</span>`
                  : '<span class="badge badge-amber">Pending</span>'}
              </div>
              <div class="quiz-card-title">${q.title}</div>
              <div class="quiz-card-desc">${q.description}</div>
              <div class="quiz-card-meta">
                <div class="quiz-meta-item">
                  <span class="meta-val">${q.questions ? q.questions.length : 0}</span>
                  <span class="meta-lbl">Soal</span>
                </div>
                <div class="quiz-meta-item">
                  <span class="meta-val">${q.timeLimit || q.time_limit}m</span>
                  <span class="meta-lbl">Waktu</span>
                </div>
                <div class="quiz-meta-item">
                  <span class="meta-val">${q.passingScore || q.passing_score}%</span>
                  <span class="meta-lbl">Min. Lulus</span>
                </div>
              </div>
              <div style="margin-top:16px;">
                ${done
                  ? `<div style="text-align:center;">
                      <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:800;color:${result.score>=80?'var(--green)':result.score>=60?'var(--amber)':'var(--red)'};">${result.score}%</div>
                      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">${result.correctCount || result.correct_count} benar · ${result.wrongCount || result.wrong_count} salah · ${result.skippedCount || result.skipped_count} skip</div>
                      <button class="btn btn-ghost btn-sm btn-full" onclick="App.startQuiz(${q.id})">Ulangi Tes</button>
                    </div>`
                  : `<button class="btn btn-primary btn-full" onclick="App.startQuiz(${q.id})">Mulai Tes →</button>`}
              </div>
            </div>`;
          }).join('')}</div>`}
    </div>`;
  },

  async _employeeResults() {
    const userId = Auth.currentUser.id;
    let results = [];

    try {
      results = await API.getMyResults();
    } catch(e) {
      results = DB.getUserResults(userId);
    }

    results = [...results].sort((a,b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Hasil Tes Saya</h1>
        <p>${results.length} hasil tes tercatat.</p>
      </div>
    </div>
    <div class="page-body">
      ${results.length === 0
        ? '<div class="empty-state"><div class="empty-icon">📭</div><h3>Belum ada hasil</h3><p>Anda belum mengerjakan kuis apapun.</p></div>'
        : results.map(r => {
            const qId = r.quizId || r.quiz_id;
            const q = DB.getQuiz(qId);
            const sc = r.score;
            const mins = Math.floor((r.timeUsed || r.time_used)/60);
            const secs = (r.timeUsed || r.time_used) % 60;
            const d = new Date(r.date || r.created_at).toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'});
            const correct = r.correctCount || r.correct_count || 0;
            const wrong = r.wrongCount || r.wrong_count || 0;
            const skipped = r.skippedCount || r.skipped_count || 0;
            return `
            <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:20px;">
              <div style="font-size:2rem;">${q?.icon || '📋'}</div>
              <div style="flex:1;">
                <div style="font-weight:700;margin-bottom:4px;">${q?.title || 'Kuis'}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${d} · Waktu: ${mins}m ${secs}s</div>
                <div style="margin-top:8px;display:flex;gap:16px;">
                  <span style="font-size:0.82rem;color:var(--green);">✓ ${correct} Benar</span>
                  <span style="font-size:0.82rem;color:var(--red);">✗ ${wrong} Salah</span>
                  ${skipped > 0 ? `<span style="font-size:0.82rem;color:var(--amber);">⏭ ${skipped} Skip</span>` : ''}
                </div>
              </div>
              <div style="text-align:center;">
                <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:${sc>=80?'var(--green)':sc>=60?'var(--amber)':'var(--red)'};">${sc}%</div>
                <span class="badge ${r.passed?'badge-green':'badge-red'}">${r.passed?'Lulus':'Tidak Lulus'}</span>
              </div>
            </div>`;
          }).join('')}
    </div>`;
  },

  // ===== QUIZ TAKING =====
  startQuiz(quizId) {
    const quiz = DB.getQuiz(quizId);
    if (!quiz) return;
    this._pageData = { quizId };
    this.currentPage = 'quiz-take';
    this.render();
  },

  _quizTakePage() {
    return `<div id="quiz-container"></div>`;
  },

  _initQuiz() {
    const quiz = DB.getQuiz(this._pageData.quizId);
    QuizEngine.start(quiz);
    this._renderQuestion();

    QuizEngine.startTimer(
      (t) => {
        const el = document.getElementById('quiz-timer');
        if (el) {
          el.textContent = '⏱ ' + QuizEngine.formatTime(t);
          el.className = 'quiz-timer' + (t <= 60 ? ' danger' : t <= 180 ? ' warning' : '');
        }
      },
      () => {
        this.notify('Waktu habis! Jawaban otomatis dikumpulkan.', 'error');
        setTimeout(() => this._submitQuiz(), 500);
      }
    );
  },

  _renderQuestion() {
    const q = QuizEngine.activeQuiz;
    const idx = QuizEngine.currentQ;
    const question = q.questions[idx];
    const total = q.questions.length;
    const answered = Object.keys(QuizEngine.answers).length;
    const optLetters = ['A','B','C','D','E'];

    document.getElementById('quiz-container').innerHTML = `
    <div class="quiz-screen">
      <div class="quiz-topbar">
        <div class="quiz-topbar-left">
          <span style="font-size:1.2rem;">${q.icon}</span>
          <h2>${q.title}</h2>
          <div class="quiz-progress-wrap">
            <div class="quiz-progress-bar">
              <div class="quiz-progress-fill" style="width:${(answered/total)*100}%"></div>
            </div>
            <span class="quiz-progress-text">${answered}/${total} terjawab</span>
          </div>
        </div>
        <div id="quiz-timer" class="quiz-timer">⏱ ${QuizEngine.formatTime(QuizEngine.timeLeft)}</div>
      </div>

      <div class="quiz-body">
        <div class="question-nav">
          ${q.questions.map((qq, i) => `
            <button class="q-nav-btn ${i===idx?'current':QuizEngine.answers[qq.id]!==undefined?'answered':''}"
              onclick="App._goToQuestion(${i})">${i+1}</button>
          `).join('')}
        </div>

        <div class="question-card">
          <div class="question-num">Pertanyaan ${idx + 1} dari ${total}</div>
          <div class="question-text">${question.text}</div>
          <div class="options-grid">
            ${question.options.map((opt, i) => `
              <div class="option-item ${QuizEngine.answers[question.id]===i?'selected':''}"
                onclick="App._selectAnswer(${question.id}, ${i})">
                <div class="option-letter">${optLetters[i]}</div>
                <div class="option-text">${opt}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="quiz-nav-buttons">
          <button class="btn btn-ghost" onclick="App._goToQuestion(${idx-1})"
            ${idx===0?'disabled style="opacity:0.4;cursor:not-allowed;"':''}>
            ← Sebelumnya
          </button>
          <div style="display:flex;gap:10px;">
            ${idx < total - 1
              ? `<button class="btn btn-primary" onclick="App._goToQuestion(${idx+1})">Selanjutnya →</button>`
              : `<button class="btn btn-success" onclick="App._confirmSubmit()">🏁 Selesai & Kumpulkan</button>`}
          </div>
        </div>
      </div>
    </div>`;
  },

  _goToQuestion(idx) {
    const total = QuizEngine.activeQuiz.questions.length;
    if (idx < 0 || idx >= total) return;
    QuizEngine.currentQ = idx;
    this._renderQuestion();
  },

  _selectAnswer(questionId, optIndex) {
    QuizEngine.answer(questionId, optIndex);
    this._renderQuestion();
  },

  _confirmSubmit() {
    const total = QuizEngine.activeQuiz.questions.length;
    const answered = Object.keys(QuizEngine.answers).length;
    const unanswered = total - answered;

    this.showModal(`
      <div class="modal-header">
        <h3>🏁 Kumpulkan Jawaban?</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;">
          <div><div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--green);">${answered}</div><div style="font-size:0.75rem;color:var(--text-muted);">Terjawab</div></div>
          <div><div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--amber);">${unanswered}</div><div style="font-size:0.75rem;color:var(--text-muted);">Belum</div></div>
          <div><div style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;">${total}</div><div style="font-size:0.75rem;color:var(--text-muted);">Total</div></div>
        </div>
      </div>
      ${unanswered > 0
        ? `<p style="color:var(--amber);font-size:0.88rem;margin-bottom:16px;">⚠️ Masih ada <strong>${unanswered} soal</strong> yang belum dijawab. Soal kosong dihitung salah.</p>`
        : '<p style="color:var(--green);font-size:0.88rem;margin-bottom:16px;">✅ Semua soal telah dijawab. Siap dikumpulkan!</p>'}
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Kembali</button>
        <button class="btn btn-success" onclick="App.closeModal();App._submitQuiz()">Ya, Kumpulkan →</button>
      </div>
    `);
  },

  async _submitQuiz() {
    QuizEngine.stopTimer();
    const result = QuizEngine.submit();
    DB.addResult(result);
    try {
      await API.submitResult(result);
    } catch(e) {
      console.error('Gagal simpan hasil ke server:', e.message);
    }
    this._pageData = result;
    this.currentPage = 'quiz-result';
    this.render();
  },

  // ===== RESULT PAGE =====
  _resultPage(result) {
    const quiz = DB.getQuiz(result.quizId);
    const sc = result.score;
    const r = 54; const circ = 2 * Math.PI * r;
    const scoreDash = (sc / 100) * circ;
    const mins = Math.floor(result.timeUsed/60);
    const secs = result.timeUsed % 60;
    const color = sc>=80?'var(--green)':sc>=60?'var(--amber)':'var(--red)';

    return `
    <div class="result-screen">
      <div class="result-card">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);font-family:var(--font-display);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">${quiz?.icon} ${quiz?.title}</div>

        <div class="result-score-ring">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="var(--bg-elevated)" stroke-width="16"/>
            <circle cx="70" cy="70" r="${r}" fill="none" stroke="${color}" stroke-width="16"
              stroke-dasharray="${scoreDash} ${circ}" stroke-linecap="round"
              transform="rotate(-90 70 70)"
              style="transition:stroke-dasharray 1s ease;"/>
          </svg>
          <div class="score-num" style="color:${color};">${sc}%</div>
        </div>

        <h2>${result.passed ? '🎉 Selamat!' : '😔 Coba Lagi'}</h2>
        <p class="result-subtitle">${result.passed ? 'Anda berhasil lulus dengan nilai yang baik.' : 'Nilai Anda belum mencapai batas kelulusan. Semangat untuk mencoba lagi!'}</p>

        <div class="status-banner ${result.passed?'pass':'fail'}">
          <span class="status-icon">${result.passed ? '✅' : '❌'}</span>
          <div class="status-text">
            <h4>${result.passed ? 'LULUS' : 'TIDAK LULUS'}</h4>
            <p>Batas nilai kelulusan: ${quiz?.passingScore}% · Nilai Anda: ${sc}%</p>
          </div>
        </div>

        <div class="result-stats">
          <div class="result-stat-item">
            <div class="val correct">${result.correctCount}</div>
            <div class="lbl">✓ Benar</div>
          </div>
          <div class="result-stat-item">
            <div class="val wrong">${result.wrongCount}</div>
            <div class="lbl">✗ Salah</div>
          </div>
          <div class="result-stat-item">
            <div class="val skip">${mins}m ${secs}s</div>
            <div class="lbl">⏱ Waktu</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="btn btn-primary btn-full btn-lg" onclick="App.showAnswerReview()">📖 Lihat Pembahasan</button>
          <button class="btn btn-ghost btn-full" onclick="App.navigate('my-quizzes')">← Kembali ke Kuis</button>
        </div>
      </div>
    </div>`;
  },

  showAnswerReview() {
    const result = this._pageData;
    const quiz = DB.getQuiz(result.quizId);
    const questions = QuizEngine.activeQuiz?.questions || quiz.questions;
    const optLetters = ['A','B','C','D','E'];

    this.showModal(`
      <div class="modal-header">
        <h3>📖 Pembahasan Jawaban</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div style="max-height:60vh;overflow-y:auto;">
        ${result.answers.map((ans, i) => {
          const q = questions.find(q => q.id === ans.questionId);
          if (!q) return '';
          const correct = ans.isCorrect;
          return `
          <div class="answer-review-item ${correct?'correct-answer':'wrong-answer'}">
            <div class="answer-num">Soal ${i+1} ${correct ? '✓ Benar' : '✗ Salah'}</div>
            <div class="answer-question">${q.text}</div>
            <div class="answer-choices">
              ${q.options.map((opt, j) => {
                let cls = 'not-selected';
                if (j === ans.correct) cls = 'correct-ans';
                if (j === ans.given && j !== ans.correct) cls = 'given-wrong';
                if (j === ans.given && j === ans.correct) cls = 'given-correct';
                return `<div class="answer-choice ${cls}">${optLetters[j]}. ${opt}${j===ans.given?' ← Jawaban Anda':''}${j===ans.correct?' ✓ Benar':''}</div>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Tutup</button>
      </div>
    `);
  },

  // ===== UTILITIES =====
  showModal(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) this.closeModal(); };
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(overlay);
  },

  closeModal() {
    const el = document.getElementById('modal-overlay');
    if (el) el.remove();
  },

  notify(message, type = 'success') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = `<span class="notif-icon">${icons[type]||'ℹ️'}</span><span class="notif-text">${message}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
};

// Bootstrap
document.addEventListener('DOMContentLoaded', () => App.init());
