// ===========================
// DATA STORE — EduTest LMS
// ===========================

const DB = {
  removeQuiz(id) {
  this.quizzes = this.quizzes.filter(q => q.id !== id);
  this.results  = this.results.filter(r => r.quizId !== id);
},
  users: [
    { id: 1, name: 'Dwi Putro Bagus Sugianto', email: 'dwi@infotama.net.id', password: 'admin123', role: 'admin', department: 'Management', avatar: 'DW' },
    { id: 2, name: 'Sevti Ariyani', email: 'sevti@infotama.net.id', password: 'sevti123', role: 'admin', department: 'HR', avatar: 'SA' },
    { id: 3, name: 'Dhika', email: 'dhika@infotama.net.id', password: 'dhika123', role: 'employee', department: 'NOC', avatar: 'D' },
  ],

  quizzes: [
    {
      id: 1,
      title: 'K3 & Keselamatan Kerja',
      description: 'Tes pengetahuan Kesehatan, Keselamatan, dan Keamanan di lingkungan kerja.',
      icon: '⛑️',
      category: 'Compliance',
      timeLimit: 15,
      passingScore: 70,
      questions: [
        {
          id: 1, text: 'APD (Alat Pelindung Diri) wajib digunakan saat bekerja di area produksi. Yang BUKAN termasuk APD adalah...',
          options: ['Helm Safety', 'Sepatu Safety', 'Dasi', 'Sarung Tangan'], correct: 2
        },
        {
          id: 2, text: 'Nomor darurat yang harus dihubungi jika terjadi kebakaran di area kerja adalah...',
          options: ['110', '112', '113', '119'], correct: 3
        },
        {
          id: 3, text: 'MSDS (Material Safety Data Sheet) berisi informasi tentang...',
          options: ['Prosedur cuti karyawan', 'Bahaya dan penanganan bahan kimia', 'Jadwal produksi', 'Data keuangan perusahaan'], correct: 1
        },
        {
          id: 4, text: 'Jika terjadi kecelakaan kerja, langkah PERTAMA yang harus dilakukan adalah...',
          options: ['Laporkan ke atasan', 'Berikan pertolongan pertama', 'Foto kejadian', 'Catat di logbook'], correct: 1
        },
        {
          id: 5, text: 'APAR (Alat Pemadam Api Ringan) harus diperiksa secara berkala setiap...',
          options: ['1 minggu', '1 bulan', '6 bulan', '1 tahun'], correct: 1
        },
        {
          id: 6, text: 'Simbol hazard berwarna merah dengan gambar api menunjukkan bahan yang bersifat...',
          options: ['Beracun', 'Korosif', 'Mudah terbakar', 'Radioaktif'], correct: 2
        },
        {
          id: 7, text: 'Ergonomi kerja yang baik bertujuan untuk...',
          options: ['Meningkatkan kecepatan produksi', 'Mengurangi cedera akibat kerja', 'Mengurangi biaya produksi', 'Meningkatkan keuntungan'], correct: 1
        },
        {
          id: 8, text: 'Lock-Out Tag-Out (LOTO) digunakan untuk...',
          options: ['Mengunci ruang kerja', 'Mencegah mesin menyala secara tak sengaja saat maintenance', 'Mengunci loker karyawan', 'Membatasi akses area tertentu'], correct: 1
        },
        {
          id: 9, text: 'Kebisingan di lingkungan kerja yang melebihi berapa dB dianggap berbahaya untuk pendengaran?',
          options: ['60 dB', '75 dB', '85 dB', '100 dB'], correct: 2
        },
        {
          id: 10, text: 'Pelanggaran prosedur K3 yang berulang dapat mengakibatkan...',
          options: ['Kenaikan gaji', 'Penghargaan karyawan', 'Sanksi disiplin hingga PHK', 'Promosi jabatan'], correct: 2
        }
      ],
      assignedTo: [2, 3, 4, 5, 6]
    },
    {
      id: 2,
      title: 'Orientasi Perusahaan',
      description: 'Tes pemahaman visi, misi, nilai-nilai perusahaan dan kebijakan dasar organisasi.',
      icon: '🏢',
      category: 'Onboarding',
      timeLimit: 10,
      passingScore: 75,
      questions: [
        {
          id: 1, text: 'Visi perusahaan kami berfokus pada...',
          options: ['Keuntungan maksimal', 'Inovasi berkelanjutan dan kesejahteraan karyawan', 'Ekspansi bisnis ke luar negeri', 'Dominasi pasar lokal'], correct: 1
        },
        {
          id: 2, text: 'Jam kerja standar perusahaan adalah...',
          options: ['08:00 - 16:00', '08:00 - 17:00', '09:00 - 18:00', '07:00 - 15:00'], correct: 1
        },
        {
          id: 3, text: 'Berapa hari cuti tahunan yang diberikan perusahaan kepada karyawan yang telah bekerja minimal 1 tahun?',
          options: ['10 hari', '12 hari', '14 hari', '15 hari'], correct: 1
        },
        {
          id: 4, text: 'Kebijakan perusahaan mengenai penggunaan media sosial saat jam kerja adalah...',
          options: ['Bebas digunakan', 'Dilarang sama sekali', 'Hanya untuk kepentingan perusahaan', 'Terbatas 30 menit per hari'], correct: 2
        },
        {
          id: 5, text: 'Dress code resmi perusahaan pada hari Senin–Kamis adalah...',
          options: ['Bebas (casual)', 'Smart casual', 'Formal (kemeja/blazer)', 'Seragam perusahaan'], correct: 3
        },
        {
          id: 6, text: 'Pelaporan pelanggaran etika atau fraud dapat dilakukan melalui...',
          options: ['Langsung ke CEO', 'Whistle-blower system / HR', 'Media sosial', 'Abaikan saja'], correct: 1
        },
        {
          id: 7, text: 'Nilai inti (core values) perusahaan yang harus dipegang setiap karyawan mencakup...',
          options: ['Integritas, Kolaborasi, Inovasi', 'Profit, Efisiensi, Ekspansi', 'Kecepatan, Akurasi, Volume', 'Hierarki, Kontrol, Disiplin'], correct: 0
        },
        {
          id: 8, text: 'Penilaian kinerja karyawan dilakukan secara...',
          options: ['Tidak pernah', 'Bulanan', 'Semesteran', 'Tahunan'], correct: 3
        }
      ],
      assignedTo: [2, 4, 6]
    },
    {
      id: 3,
      title: 'Digital & Cyber Security',
      description: 'Pengetahuan dasar keamanan informasi dan perlindungan data perusahaan.',
      icon: '🔐',
      category: 'IT & Security',
      timeLimit: 12,
      passingScore: 80,
      questions: [
        {
          id: 1, text: 'Phishing adalah serangan siber yang bertujuan untuk...',
          options: ['Memperlambat jaringan', 'Mencuri informasi sensitif melalui penipuan', 'Menyerang server perusahaan', 'Mengenkripsi data secara paksa'], correct: 1
        },
        {
          id: 2, text: 'Password yang kuat sebaiknya mengandung...',
          options: ['Nama pengguna saja', 'Minimal 8 karakter kombinasi huruf, angka, dan simbol', 'Tanggal lahir', 'Kata umum yang mudah diingat'], correct: 1
        },
        {
          id: 3, text: 'Apa yang harus dilakukan jika menerima email mencurigakan dari pengirim tidak dikenal?',
          options: ['Klik link yang ada', 'Download attachment', 'Hapus dan laporkan ke IT', 'Forward ke rekan kerja'], correct: 2
        },
        {
          id: 4, text: 'Two-Factor Authentication (2FA) memberikan keamanan tambahan berupa...',
          options: ['Password dua kali', 'Verifikasi tambahan selain password', 'Dua akun terpisah', 'Dua perangkat berbeda'], correct: 1
        },
        {
          id: 5, text: 'Ransomware adalah jenis malware yang...',
          options: ['Mengintai aktivitas pengguna', 'Mengenkripsi data dan meminta tebusan', 'Mengirim spam email', 'Menghapus sistem operasi'], correct: 1
        },
        {
          id: 6, text: 'Data perusahaan yang bersifat rahasia (confidential) TIDAK boleh...',
          options: ['Disimpan di server perusahaan', 'Dibagikan ke pihak luar tanpa izin', 'Diakses oleh karyawan berwenang', 'Di-backup secara berkala'], correct: 1
        },
        {
          id: 7, text: 'VPN (Virtual Private Network) digunakan untuk...',
          options: ['Mempercepat koneksi internet', 'Memblokir website tertentu', 'Mengamankan koneksi jaringan', 'Meningkatkan bandwidth'], correct: 2
        }
      ],
      assignedTo: [3, 5, 6]
    }
  ],

  results: [
    { id: 1, userId: 2, quizId: 1, score: 85, correctCount: 8, wrongCount: 2, skippedCount: 0, passed: true, timeUsed: 780, date: '2025-11-10T09:15:00', answers: [] },
    { id: 2, userId: 3, quizId: 1, score: 60, correctCount: 6, wrongCount: 4, skippedCount: 0, passed: false, timeUsed: 900, date: '2025-11-11T10:30:00', answers: [] },
    { id: 3, userId: 4, quizId: 2, score: 90, correctCount: 7, wrongCount: 1, skippedCount: 0, passed: true, timeUsed: 420, date: '2025-11-12T14:00:00', answers: [] },
    { id: 4, userId: 5, quizId: 1, score: 70, correctCount: 7, wrongCount: 3, skippedCount: 0, passed: true, timeUsed: 860, date: '2025-11-13T11:00:00', answers: [] },
    { id: 5, userId: 6, quizId: 3, score: 80, correctCount: 5, wrongCount: 2, skippedCount: 0, passed: true, timeUsed: 550, date: '2025-11-14T16:30:00', answers: [] },
  ],

  nextId: { users: 7, results: 6 },

  // Helpers
  getUser(id) { return this.users.find(u => u.id === id); },
  getQuiz(id) { return this.quizzes.find(q => q.id === id); },
  getUserResults(userId) { return this.results.filter(r => r.userId === userId); },
  getQuizResults(quizId) { return this.results.filter(r => r.quizId === quizId); },
  getUserQuizResult(userId, quizId) { return this.results.find(r => r.userId === userId && r.quizId === quizId); },
  getAssignedQuizzes(userId) { return this.quizzes.filter(q => q.assignedTo.includes(userId)); },

  addResult(result) {
    result.id = this.nextId.results++;
    this.results.push(result);
    return result;
  },

  addUser(user) {
    user.id = this.nextId.users++;
    this.users.push(user);
    return user;
  },

  removeUser(id) {
    this.users = this.users.filter(u => u.id !== id);
    this.quizzes.forEach(q => { q.assignedTo = q.assignedTo.filter(uid => uid !== id); });
  }
};
