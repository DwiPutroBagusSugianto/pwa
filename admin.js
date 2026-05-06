// ===========================
// ADMIN VIEWS — EduTest LMS
// ===========================

const AdminViews = {

  // ---- DASHBOARD ----
  dashboard() {
    const employees = DB.users.filter(u => u.role === 'employee');
    const totalResults = DB.results.length;
    const passCount = DB.results.filter(r => r.passed).length;
    const avgScore = totalResults
      ? Math.round(DB.results.reduce((s, r) => s + r.score, 0) / totalResults)
      : 0;

    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dashboard</h1>
        <p>Selamat datang, ${Auth.currentUser.name}! Berikut ringkasan sistem.</p>
      </div>
      <div class="page-header-actions">
        <span class="badge badge-accent">Admin</span>
      </div>
    </div>
    <div class="page-body">
      <div class="stats-grid">
        <div class="stat-card accent">
          <div class="stat-icon accent">👥</div>
          <div class="stat-value">${employees.length}</div>
          <div class="stat-label">Total Karyawan</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon green">📋</div>
          <div class="stat-value">${DB.quizzes.length}</div>
          <div class="stat-label">Total Kuis</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon amber">📊</div>
          <div class="stat-value">${totalResults}</div>
          <div class="stat-label">Total Pengerjaan</div>
        </div>
        <div class="stat-card red">
          <div class="stat-icon red">🎯</div>
          <div class="stat-value">${avgScore}%</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
        ${this._recentActivity()}
        ${this._passRateChart(passCount, totalResults)}
      </div>

      ${this._recentResults()}
    </div>`;
  },

  _recentActivity() {
    const recent = [...DB.results].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    return `
    <div class="card">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;">⚡ Aktivitas Terbaru</h3>
      ${recent.length === 0 ? '<p style="color:var(--text-muted);font-size:0.85rem;">Belum ada aktivitas.</p>' :
        recent.map(r => {
          const u = DB.getUser(r.userId); const q = DB.getQuiz(r.quizId);
          return `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
            <div class="avatar-mini">${u?.avatar || '?'}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:0.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u?.name}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${q?.title}</div>
            </div>
            <span class="badge ${r.passed ? 'badge-green' : 'badge-red'}">${r.score}%</span>
          </div>`;
        }).join('')}
    </div>`;
  },

  _passRateChart(passCount, total) {
    const failCount = total - passCount;
    const passRate = total ? Math.round((passCount/total)*100) : 0;
    const failRate = 100 - passRate;

    const r = 54; const circ = 2 * Math.PI * r;
    const passDash = (passRate / 100) * circ;
    const failDash = (failRate / 100) * circ;

    return `
    <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;align-self:flex-start;">🏆 Tingkat Kelulusan</h3>
      <div style="position:relative;width:130px;height:130px;margin-bottom:16px;">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--bg-elevated)" stroke-width="14"/>
          <circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--green)" stroke-width="14"
            stroke-dasharray="${passDash} ${circ}" stroke-linecap="round"
            transform="rotate(-90 65 65)"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-family:var(--font-display);font-size:1.6rem;font-weight:800;color:var(--green);">${passRate}%</span>
          <span style="font-size:0.7rem;color:var(--text-muted);">Lulus</span>
        </div>
      </div>
      <div style="display:flex;gap:20px;">
        <div style="text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:var(--green);">${passCount}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">Lulus</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.3rem;font-weight:700;color:var(--red);">${failCount}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">Tidak Lulus</div>
        </div>
      </div>
    </div>`;
  },

  _recentResults() {
    const results = [...DB.results].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,8);
    return `
    <div class="table-wrap">
      <div class="table-header">
        <h3>Hasil Tes Terbaru</h3>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('results')">Lihat Semua →</button>
      </div>
      <table>
        <thead><tr>
          <th>Karyawan</th><th>Kuis</th><th>Nilai</th><th>Status</th><th>Tanggal</th>
        </tr></thead>
        <tbody>
          ${results.map(r => {
            const u = DB.getUser(r.userId); const q = DB.getQuiz(r.quizId);
            const d = new Date(r.date).toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'});
            const sc = r.score; const cls = sc>=80?'high':sc>=60?'mid':'low';
            return `<tr>
              <td><div class="avatar-cell"><div class="avatar-mini">${u?.avatar||'?'}</div><span>${u?.name}</span></div></td>
              <td>${q?.title || '-'}</td>
              <td><div class="score-bar-wrap">
                <div class="score-bar"><div class="score-bar-fill ${cls}" style="width:${sc}%"></div></div>
                <span class="score-text" style="color:${sc>=80?'var(--green)':sc>=60?'var(--amber)':'var(--red)'}">${sc}%</span>
              </div></td>
              <td><span class="badge ${r.passed?'badge-green':'badge-red'}">${r.passed?'Lulus':'Tidak Lulus'}</span></td>
              <td style="color:var(--text-muted);font-size:0.82rem;">${d}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  },

  // ---- EMPLOYEES ----
  employees() {
    const employees = DB.users.filter(u => u.role === 'employee');
    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Manajemen Karyawan</h1>
        <p>${employees.length} karyawan terdaftar dalam sistem.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="AdminViews.showAddUserModal()">+ Tambah Karyawan</button>
      </div>
    </div>
    <div class="page-body">
      <div class="table-wrap">
        <div class="table-header">
          <h3>Daftar Karyawan</h3>
          <div class="table-search">
            <span>🔍</span>
            <input type="text" placeholder="Cari karyawan..." id="employee-search" oninput="AdminViews.filterEmployees(this.value)"/>
          </div>
        </div>
        <table id="employees-table">
          <thead><tr>
            <th>Nama</th><th>Email</th><th>Departemen</th>
            <th>Tes Selesai</th><th>Rata-rata</th><th>Aksi</th>
          </tr></thead>
          <tbody id="employees-body">
            ${this._employeeRows(employees)}
          </tbody>
        </table>
      </div>
    </div>`;
  },

  _employeeRows(employees) {
    return employees.map(u => {
      const results = DB.getUserResults(u.id);
      const avgScore = results.length
        ? Math.round(results.reduce((s,r) => s + r.score, 0) / results.length)
        : null;
      const sc = avgScore;
      const cls = sc===null?'muted':sc>=80?'high':sc>=60?'mid':'low';
      return `<tr data-id="${u.id}">
        <td><div class="avatar-cell"><div class="avatar-mini">${u.avatar}</div><strong>${u.name}</strong></div></td>
        <td style="color:var(--text-secondary);font-size:0.85rem;">${u.email}</td>
        <td><span class="badge badge-muted">${u.department}</span></td>
        <td>${results.length} tes</td>
        <td>${sc === null ? '<span style="color:var(--text-muted)">-</span>' :
          `<div class="score-bar-wrap">
            <div class="score-bar"><div class="score-bar-fill ${cls}" style="width:${sc}%"></div></div>
            <span class="score-text" style="color:${sc>=80?'var(--green)':sc>=60?'var(--amber)':'var(--red)'}">${sc}%</span>
          </div>`}
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="AdminViews.showEmployeeDetail(${u.id})">Detail</button>
            <button class="btn btn-danger btn-sm" onclick="AdminViews.confirmDeleteUser(${u.id})">Hapus</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filterEmployees(q) {
    const employees = DB.users.filter(u => u.role === 'employee');
    const filtered = q
      ? employees.filter(u =>
          u.name.toLowerCase().includes(q.toLowerCase()) ||
          u.email.toLowerCase().includes(q.toLowerCase()) ||
          u.department.toLowerCase().includes(q.toLowerCase()))
      : employees;
    document.getElementById('employees-body').innerHTML = this._employeeRows(filtered);
  },

  showAddUserModal() {
    App.showModal(`
      <div class="modal-header">
        <h3>➕ Tambah Karyawan Baru</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div class="form-group">
        <label class="form-label">Nama Lengkap</label>
        <input class="form-input" id="new-name" type="text" placeholder="Contoh: Andi Susanto"/>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="new-email" type="email" placeholder="andi@perusahaan.com"/>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-input" id="new-password" type="password" placeholder="Minimal 6 karakter"/>
      </div>
      <div class="form-group">
        <label class="form-label">Departemen</label>
        <select class="form-select" id="new-dept">
          <option>HR</option><option>Engineering</option><option>Marketing</option>
          <option>Finance</option><option>IT</option><option>Operations</option><option>Management</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="AdminViews.addUser()">Simpan</button>
      </div>
    `);
  },

  addUser() {
    const name = document.getElementById('new-name').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value.trim();
    const dept = document.getElementById('new-dept').value;

    if (!name || !email || !password) return App.notify('Semua field wajib diisi!', 'error');
    if (DB.users.find(u => u.email === email)) return App.notify('Email sudah terdaftar!', 'error');

    const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    DB.addUser({ name, email, password, role: 'employee', department: dept, avatar: initials });
    App.closeModal();
    App.notify(`Karyawan ${name} berhasil ditambahkan!`, 'success');
    App.navigate('employees');
  },

  showEmployeeDetail(id) {
    const u = DB.getUser(id);
    const results = DB.getUserResults(id);
    App.showModal(`
      <div class="modal-header">
        <h3>Detail Karyawan</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border);">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--green));display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:1.2rem;">${u.avatar}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:700;">${u.name}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);">${u.email}</div>
          <span class="badge badge-muted" style="margin-top:4px;">${u.department}</span>
        </div>
      </div>
      <h4 style="font-size:0.85rem;font-weight:700;color:var(--text-muted);margin-bottom:12px;font-family:var(--font-display);letter-spacing:0.05em;text-transform:uppercase;">Riwayat Tes</h4>
      ${results.length === 0
        ? '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px;">Belum ada hasil tes.</p>'
        : results.map(r => {
            const q = DB.getQuiz(r.quizId);
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
              <div>
                <div style="font-size:0.88rem;font-weight:500;">${q?.title}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${new Date(r.date).toLocaleDateString('id-ID')}</div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:${r.score>=80?'var(--green)':r.score>=60?'var(--amber)':'var(--red)'};">${r.score}%</span>
                <span class="badge ${r.passed?'badge-green':'badge-red'}">${r.passed?'Lulus':'Tidak Lulus'}</span>
              </div>
            </div>`;
          }).join('')}
      <div class="modal-footer" style="justify-content:center;">
        <button class="btn btn-ghost" onclick="App.closeModal()">Tutup</button>
      </div>
    `);
  },

  confirmDeleteUser(id) {
    const u = DB.getUser(id);
    App.showModal(`
      <div class="modal-header">
        <h3>Hapus Karyawan</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <p style="color:var(--text-secondary);margin-bottom:24px;">Apakah Anda yakin ingin menghapus karyawan <strong style="color:var(--text-primary);">${u.name}</strong>? Data ini tidak dapat dipulihkan.</p>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-danger" onclick="AdminViews.deleteUser(${id})">Ya, Hapus</button>
      </div>
    `);
  },

  deleteUser(id) {
    DB.removeUser(id);
    App.closeModal();
    App.notify('Karyawan berhasil dihapus.', 'success');
    App.navigate('employees');
  },

  // ---- QUIZZES MANAGEMENT ----
  quizzes() {
    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Manajemen Kuis</h1>
        <p>${DB.quizzes.length} kuis tersedia dalam sistem.</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="AdminViews.showAddQuizModal()">+ Tambah Kuis</button>
      </div>
    </div>
    <div class="page-body">
      <div class="quiz-grid">
        ${DB.quizzes.map(q => {
          const results = DB.getQuizResults(q.id);
          const assigned = q.assignedTo.length;
          const done = results.length;
          const passRate = done ? Math.round((results.filter(r=>r.passed).length/done)*100) : 0;
          return `
          <div class="quiz-card">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
              <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();AdminViews.confirmDeleteQuiz(${q.id})">🗑 Hapus</button>
            </div>
            <div onclick="AdminViews.showQuizDetail(${q.id})" style="cursor:pointer;">
              <div class="quiz-card-header">
                <div class="quiz-card-icon">${q.icon}</div>
                <span class="badge badge-accent">${q.category}</span>
              </div>
              <div class="quiz-card-title">${q.title}</div>
              <div class="quiz-card-desc">${q.description}</div>
              <div class="quiz-card-meta">
                <div class="quiz-meta-item">
                  <span class="meta-val">${q.questions.length}</span>
                  <span class="meta-lbl">Soal</span>
                </div>
                <div class="quiz-meta-item">
                  <span class="meta-val">${q.timeLimit}m</span>
                  <span class="meta-lbl">Durasi</span>
                </div>
                <div class="quiz-meta-item">
                  <span class="meta-val">${assigned}</span>
                  <span class="meta-lbl">Ditugaskan</span>
                </div>
                <div class="quiz-meta-item">
                  <span class="meta-val" style="color:${passRate>=70?'var(--green)':'var(--amber)'};">${done > 0 ? passRate + '%' : '-'}</span>
                  <span class="meta-lbl">Pass Rate</span>
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  showQuizDetail(id) {
    const q = DB.getQuiz(id);
    const results = DB.getQuizResults(id);
    App.showModal(`
      <div class="modal-header">
        <h3>${q.icon} ${q.title}</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div class="tabs" style="margin-bottom:20px;">
        <button class="tab-btn active" id="tab-info" onclick="AdminViews._quizTab('info',${id})">Informasi</button>
        <button class="tab-btn" id="tab-questions" onclick="AdminViews._quizTab('questions',${id})">Soal (${q.questions.length})</button>
        <button class="tab-btn" id="tab-results" onclick="AdminViews._quizTab('results',${id})">Hasil (${results.length})</button>
        <button class="tab-btn" id="tab-assign" onclick="AdminViews._quizTab('assign',${id})">Penugasan</button>
      </div>
      <div id="quiz-modal-body">${this._quizTabInfo(q)}</div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Tutup</button>
      </div>
    `);
  },

  _quizTab(tab, id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    const q = DB.getQuiz(id);
    const body = document.getElementById('quiz-modal-body');
    if (tab === 'info') body.innerHTML = this._quizTabInfo(q);
    else if (tab === 'questions') body.innerHTML = this._quizTabQuestions(id);
    else if (tab === 'results') body.innerHTML = this._quizTabResults(id);
    else body.innerHTML = this._quizTabAssign(id);
  },

  _quizTabInfo(q) {
    return `
    <div class="detail-grid">
      <div class="detail-item"><span class="dlbl">Kategori</span><span class="dval">${q.category}</span></div>
      <div class="detail-item"><span class="dlbl">Durasi</span><span class="dval">${q.timeLimit} menit</span></div>
      <div class="detail-item"><span class="dlbl">Jumlah Soal</span><span class="dval">${q.questions.length} pertanyaan</span></div>
      <div class="detail-item"><span class="dlbl">Nilai Lulus</span><span class="dval">${q.passingScore}%</span></div>
    </div>
    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:16px;">${q.description}</p>
    <h4 style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin-bottom:10px;font-family:var(--font-display);letter-spacing:0.05em;text-transform:uppercase;">Preview Soal</h4>
    ${q.questions.slice(0,3).map((qu,i) => `
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:8px;">
        <div style="font-size:0.75rem;color:var(--accent);font-weight:700;margin-bottom:4px;">Soal ${i+1}</div>
        <div style="font-size:0.85rem;">${qu.text}</div>
      </div>`).join('')}
    ${q.questions.length > 3 ? `<p style="font-size:0.8rem;color:var(--text-muted);text-align:center;">...dan ${q.questions.length - 3} soal lainnya</p>` : ''}`;
  },

  _quizTabResults(id) {
    const results = DB.getQuizResults(id);
    if (results.length === 0) return '<div class="empty-state"><div class="empty-icon">📭</div><h3>Belum ada hasil</h3><p>Tidak ada karyawan yang telah mengerjakan kuis ini.</p></div>';
    return `<div style="max-height:320px;overflow-y:auto;">
      ${results.map(r => {
        const u = DB.getUser(r.userId);
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar-mini">${u?.avatar}</div>
            <div>
              <div style="font-size:0.88rem;font-weight:500;">${u?.name}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${new Date(r.date).toLocaleDateString('id-ID')} · ${r.correctCount}✓ ${r.wrongCount}✗</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-family:var(--font-display);font-size:1rem;font-weight:700;color:${r.score>=80?'var(--green)':r.score>=60?'var(--amber)':'var(--red)'};">${r.score}%</span>
            <span class="badge ${r.passed?'badge-green':'badge-red'}">${r.passed?'Lulus':'Gagal'}</span>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _quizTabAssign(id) {
    const q = DB.getQuiz(id);
    const employees = DB.users.filter(u => u.role === 'employee');
    return `
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:14px;">Pilih karyawan yang akan mendapatkan akses ke kuis ini:</p>
    <div style="max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
      ${employees.map(u => {
        const assigned = q.assignedTo.includes(u.id);
        return `
        <label style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);">
          <input type="checkbox" ${assigned ? 'checked' : ''} onchange="AdminViews.toggleAssign(${id},${u.id},this.checked)"
            style="accent-color:var(--accent);width:16px;height:16px;cursor:pointer;"/>
          <div class="avatar-mini">${u.avatar}</div>
          <div style="flex:1;">
            <div style="font-size:0.88rem;font-weight:500;">${u.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${u.department}</div>
          </div>
          ${assigned ? '<span class="badge badge-green">Ditugaskan</span>' : ''}
        </label>`;
      }).join('')}
    </div>`;
  },

  toggleAssign(quizId, userId, assign) {
    const q = DB.getQuiz(quizId);
    if (assign && !q.assignedTo.includes(userId)) q.assignedTo.push(userId);
    else if (!assign) q.assignedTo = q.assignedTo.filter(id => id !== userId);
    this._quizTab('assign', quizId);
    App.notify(assign ? 'Akses diberikan!' : 'Akses dicabut.', 'success');
  },

  // ---- MANAJEMEN SOAL ----
  _quizTabQuestions(quizId) {
    const q = DB.getQuiz(quizId);
    return `
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
      <button class="btn btn-primary btn-sm" onclick="AdminViews.showAddQuestionForm(${quizId})">+ Tambah Soal</button>
    </div>
    <div id="questions-list" style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
      ${this._renderQuestionList(quizId)}
    </div>`;
  },

  _renderQuestionList(quizId) {
    const q = DB.getQuiz(quizId);
    if (q.questions.length === 0) {
      return `<div class="empty-state"><div class="empty-icon">📝</div><h3>Belum ada soal</h3><p>Klik "Tambah Soal" untuk mulai menambahkan soal.</p></div>`;
    }
    return q.questions.map((qu, i) => `
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
          <div style="flex:1;">
            <div style="font-size:0.72rem;color:var(--accent);font-weight:700;margin-bottom:4px;">SOAL ${i+1}</div>
            <div style="font-size:0.88rem;font-weight:500;margin-bottom:10px;">${qu.text}</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              ${qu.options.map((opt, oi) => `
                <div style="font-size:0.8rem;padding:4px 8px;border-radius:4px;
                  background:${oi === qu.correct ? 'rgba(0,200,100,0.1)' : 'transparent'};
                  color:${oi === qu.correct ? 'var(--green)' : 'var(--text-secondary)'};
                  border:1px solid ${oi === qu.correct ? 'var(--green)' : 'transparent'};">
                  ${oi === qu.correct ? '✓' : '○'} ${opt}
                </div>`).join('')}
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="AdminViews.showEditQuestionForm(${quizId}, ${qu.id})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="AdminViews.deleteQuestion(${quizId}, ${qu.id})">🗑</button>
          </div>
        </div>
      </div>`).join('');
  },

  showAddQuestionForm(quizId) {
    App.showModal(`
      <div class="modal-header">
        <h3>➕ Tambah Soal Baru</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div class="form-group">
        <label class="form-label">Teks Soal</label>
        <textarea class="form-input" id="new-q-text" rows="3"
          placeholder="Tulis pertanyaan di sini..."
          style="resize:vertical;"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Pilihan Jawaban</label>
        <input class="form-input" id="opt-0" type="text" placeholder="Pilihan A" style="margin-bottom:6px;"/>
        <input class="form-input" id="opt-1" type="text" placeholder="Pilihan B" style="margin-bottom:6px;"/>
        <input class="form-input" id="opt-2" type="text" placeholder="Pilihan C" style="margin-bottom:6px;"/>
        <input class="form-input" id="opt-3" type="text" placeholder="Pilihan D"/>
      </div>
      <div class="form-group">
        <label class="form-label">Jawaban Benar</label>
        <select class="form-select" id="correct-opt">
          <option value="0">Pilihan A</option>
          <option value="1">Pilihan B</option>
          <option value="2">Pilihan C</option>
          <option value="3">Pilihan D</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="AdminViews.showQuizDetail(${quizId})">Batal</button>
        <button class="btn btn-primary" onclick="AdminViews.saveQuestion(${quizId})">Simpan Soal</button>
      </div>
    `);
  },

  saveQuestion(quizId) {
    const text    = document.getElementById('new-q-text').value.trim();
    const opt0    = document.getElementById('opt-0').value.trim();
    const opt1    = document.getElementById('opt-1').value.trim();
    const opt2    = document.getElementById('opt-2').value.trim();
    const opt3    = document.getElementById('opt-3').value.trim();
    const correct = parseInt(document.getElementById('correct-opt').value);

    if (!text || !opt0 || !opt1 || !opt2 || !opt3)
      return App.notify('Semua field wajib diisi!', 'error');

    const q = DB.getQuiz(quizId);
    const newId = q.questions.length > 0
      ? Math.max(...q.questions.map(qu => qu.id)) + 1
      : 1;

    q.questions.push({ id: newId, text, options: [opt0, opt1, opt2, opt3], correct });

    App.notify('Soal berhasil ditambahkan!', 'success');
    AdminViews.showQuizDetail(quizId);
    setTimeout(() => AdminViews._quizTab('questions', quizId), 50);
  },

  deleteQuestion(quizId, questionId) {
    const q = DB.getQuiz(quizId);
    q.questions = q.questions.filter(qu => qu.id !== questionId);
    document.getElementById('questions-list').innerHTML = this._renderQuestionList(quizId);
    App.notify('Soal berhasil dihapus.', 'success');
  },

  showEditQuestionForm(quizId, questionId) {
    const q  = DB.getQuiz(quizId);
    const qu = q.questions.find(x => x.id === questionId);
    App.showModal(`
      <div class="modal-header">
        <h3>✏️ Edit Soal</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div class="form-group">
        <label class="form-label">Teks Soal</label>
        <textarea class="form-input" id="edit-q-text" rows="3"
          style="resize:vertical;">${qu.text}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Pilihan Jawaban</label>
        <input class="form-input" id="edit-opt-0" type="text" value="${qu.options[0]}" style="margin-bottom:6px;"/>
        <input class="form-input" id="edit-opt-1" type="text" value="${qu.options[1]}" style="margin-bottom:6px;"/>
        <input class="form-input" id="edit-opt-2" type="text" value="${qu.options[2]}" style="margin-bottom:6px;"/>
        <input class="form-input" id="edit-opt-3" type="text" value="${qu.options[3]}"/>
      </div>
      <div class="form-group">
        <label class="form-label">Jawaban Benar</label>
        <select class="form-select" id="edit-correct-opt">
          <option value="0" ${qu.correct === 0 ? 'selected' : ''}>Pilihan A</option>
          <option value="1" ${qu.correct === 1 ? 'selected' : ''}>Pilihan B</option>
          <option value="2" ${qu.correct === 2 ? 'selected' : ''}>Pilihan C</option>
          <option value="3" ${qu.correct === 3 ? 'selected' : ''}>Pilihan D</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="AdminViews.showQuizDetail(${quizId});setTimeout(()=>AdminViews._quizTab('questions',${quizId}),50)">Batal</button>
        <button class="btn btn-primary" onclick="AdminViews.saveEditQuestion(${quizId}, ${questionId})">Simpan Perubahan</button>
      </div>
    `);
  },

  saveEditQuestion(quizId, questionId) {
    const text    = document.getElementById('edit-q-text').value.trim();
    const opt0    = document.getElementById('edit-opt-0').value.trim();
    const opt1    = document.getElementById('edit-opt-1').value.trim();
    const opt2    = document.getElementById('edit-opt-2').value.trim();
    const opt3    = document.getElementById('edit-opt-3').value.trim();
    const correct = parseInt(document.getElementById('edit-correct-opt').value);

    if (!text || !opt0 || !opt1 || !opt2 || !opt3)
      return App.notify('Semua field wajib diisi!', 'error');

    const q  = DB.getQuiz(quizId);
    const qu = q.questions.find(x => x.id === questionId);

    qu.text    = text;
    qu.options = [opt0, opt1, opt2, opt3];
    qu.correct = correct;

    App.notify('Soal berhasil diperbarui!', 'success');
    AdminViews.showQuizDetail(quizId);
    setTimeout(() => AdminViews._quizTab('questions', quizId), 50);
  },

  // ---- TAMBAH KUIS ----
  showAddQuizModal() {
    App.showModal(`
      <div class="modal-header">
        <h3>➕ Tambah Kuis Baru</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <div class="form-group">
        <label class="form-label">Judul Kuis</label>
        <input class="form-input" id="q-title" type="text" placeholder="Contoh: Leadership Dasar"/>
      </div>
      <div class="form-group">
        <label class="form-label">Deskripsi</label>
        <input class="form-input" id="q-desc" type="text" placeholder="Deskripsi singkat kuis"/>
      </div>
      <div class="form-group">
        <label class="form-label">Kategori</label>
        <input class="form-input" id="q-category" type="text" placeholder="Contoh: Soft Skills"/>
      </div>
      <div class="form-group">
        <label class="form-label">Icon (emoji)</label>
        <input class="form-input" id="q-icon" type="text" placeholder="Contoh: 📘" maxlength="4"/>
      </div>
      <div class="form-group">
        <label class="form-label">Durasi (menit)</label>
        <input class="form-input" id="q-time" type="number" placeholder="Contoh: 15" min="1"/>
      </div>
      <div class="form-group">
        <label class="form-label">Nilai Lulus (%)</label>
        <input class="form-input" id="q-pass" type="number" placeholder="Contoh: 70" min="1" max="100"/>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="AdminViews.addQuiz()">Simpan</button>
      </div>
    `);
  },

  addQuiz() {
    const title        = document.getElementById('q-title').value.trim();
    const desc         = document.getElementById('q-desc').value.trim();
    const category     = document.getElementById('q-category').value.trim();
    const icon         = document.getElementById('q-icon').value.trim() || '📋';
    const timeLimit    = parseInt(document.getElementById('q-time').value);
    const passingScore = parseInt(document.getElementById('q-pass').value);

    if (!title || !desc || !category || !timeLimit || !passingScore)
      return App.notify('Semua field wajib diisi!', 'error');

    const newId = Math.max(...DB.quizzes.map(q => q.id), 0) + 1;
    DB.quizzes.push({
      id: newId, title, description: desc, icon, category,
      timeLimit, passingScore, questions: [], assignedTo: []
    });

    App.closeModal();
    App.notify(`Kuis "${title}" berhasil ditambahkan!`, 'success');
    App.navigate('quizzes');
  },

  // ---- HAPUS KUIS ----
  confirmDeleteQuiz(id) {
    const q = DB.getQuiz(id);
    App.showModal(`
      <div class="modal-header">
        <h3>Hapus Kuis</h3>
        <button class="modal-close" onclick="App.closeModal()">✕</button>
      </div>
      <p style="color:var(--text-secondary);margin-bottom:24px;">
        Apakah Anda yakin ingin menghapus kuis <strong style="color:var(--text-primary);">${q.title}</strong>?
        Semua data hasil tes terkait akan ikut terhapus.
      </p>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="App.closeModal()">Batal</button>
        <button class="btn btn-danger" onclick="AdminViews.deleteQuiz(${id})">Ya, Hapus</button>
      </div>
    `);
  },

  deleteQuiz(id) {
    DB.quizzes = DB.quizzes.filter(q => q.id !== id);
    DB.results  = DB.results.filter(r => r.quizId !== id);
    App.closeModal();
    App.notify('Kuis berhasil dihapus.', 'success');
    App.navigate('quizzes');
  },

  // ---- ALL RESULTS ----
  results() {
    const results = [...DB.results].sort((a,b) => new Date(b.date) - new Date(a.date));
    return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Hasil Tes Karyawan</h1>
        <p>${results.length} total pengerjaan tercatat dalam sistem.</p>
      </div>
    </div>
    <div class="page-body">
      <div class="table-wrap">
        <div class="table-header">
          <h3>Semua Hasil Tes</h3>
        </div>
        <table>
          <thead><tr>
            <th>Karyawan</th><th>Kuis</th><th>Nilai</th>
            <th>Benar/Salah/Skip</th><th>Waktu</th><th>Status</th><th>Tanggal</th>
          </tr></thead>
          <tbody>
            ${results.map(r => {
              const u = DB.getUser(r.userId); const q = DB.getQuiz(r.quizId);
              const sc = r.score; const cls = sc>=80?'high':sc>=60?'mid':'low';
              const mins = Math.floor(r.timeUsed/60); const secs = r.timeUsed%60;
              const d = new Date(r.date).toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'});
              return `<tr>
                <td><div class="avatar-cell"><div class="avatar-mini">${u?.avatar||'?'}</div>${u?.name}</div></td>
                <td style="font-size:0.85rem;">${q?.title}</td>
                <td><div class="score-bar-wrap">
                  <div class="score-bar"><div class="score-bar-fill ${cls}" style="width:${sc}%"></div></div>
                  <span class="score-text" style="color:${sc>=80?'var(--green)':sc>=60?'var(--amber)':'var(--red)'}">${sc}%</span>
                </div></td>
                <td><span style="color:var(--green)">${r.correctCount}✓</span> <span style="color:var(--red)">${r.wrongCount}✗</span> <span style="color:var(--amber)">${r.skippedCount}⏭</span></td>
                <td style="font-size:0.82rem;color:var(--text-secondary);">${mins}m ${secs}s</td>
                <td><span class="badge ${r.passed?'badge-green':'badge-red'}">${r.passed?'Lulus':'Tidak Lulus'}</span></td>
                <td style="color:var(--text-muted);font-size:0.82rem;">${d}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

};
