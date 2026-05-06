# 🎓 EduTest LMS — Sistem Kuis Karyawan

Platform evaluasi karyawan berbasis web modern yang dibangun dengan **Vanilla JavaScript, HTML5, dan CSS3**. Siap di-deploy ke GitHub Pages tanpa backend.

## ✨ Fitur Utama

### 👤 Peran Admin
- **Dashboard** — Statistik real-time: total karyawan, kuis, pengerjaan, rata-rata nilai
- **Manajemen Karyawan** — Tambah, lihat detail, hapus akun karyawan
- **Manajemen Kuis** — Lihat detail soal, pass rate, pemberian akses per karyawan
- **Laporan Hasil** — Semua hasil tes dengan filter dan skor bar visual

### 🧑‍💼 Peran Karyawan
- **Dashboard Pribadi** — Ringkasan progres dan notifikasi kuis pending
- **Kuis Saya** — Daftar kuis yang ditugaskan, mulai atau ulangi tes
- **Sistem Timer** — Countdown real-time dengan peringatan warna (kuning/merah)
- **Navigasi Soal** — Lompat antar soal, indikator sudah/belum dijawab
- **Hasil Instan** — Nilai otomatis, status lulus/tidak, ring score animasi
- **Pembahasan Jawaban** — Review semua jawaban benar/salah setelah tes

## 🚀 Demo Akun

| Nama | Email | Password | Peran |
|------|-------|----------|-------|
| Ahmad Rizky | admin@edutest.id | admin123 | Admin |
| Siti Rahma | siti@edutest.id | karyawan123 | Karyawan (HR) |
| Budi Santoso | budi@edutest.id | karyawan123 | Karyawan (Engineering) |
| Dewi Lestari | dewi@edutest.id | karyawan123 | Karyawan (Marketing) |
| Fajar Nugroho | fajar@edutest.id | karyawan123 | Karyawan (Finance) |

## 📦 Deployment ke GitHub Pages

### Langkah 1: Upload ke GitHub
```bash
git init
git add .
git commit -m "Initial commit: EduTest LMS"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

### Langkah 2: Aktifkan GitHub Pages
1. Buka repo di GitHub → **Settings**
2. Scroll ke **Pages** → Source: **Deploy from a branch**
3. Branch: `main` / `root`
4. Klik **Save**

### Langkah 3: Akses Aplikasi
URL: `https://USERNAME.github.io/REPO-NAME`

## 🗂️ Struktur File

```
lms-quiz/
├── index.html       # Entry point
├── style.css        # Dark industrial theme
├── data.js          # Data store (users, quizzes, results)
├── auth.js          # Autentikasi & session
├── quiz.js          # Quiz engine (timer, scoring, shuffle)
├── admin.js         # Admin views & UI components
└── app.js           # Router & main controller
```

## 🛠️ Tech Stack

- **HTML5** — Markup semantik
- **CSS3** — Custom properties, Grid, Flexbox, animasi
- **Vanilla JavaScript** — Zero dependencies, ES6+
- **Google Fonts** — Syne (display) + DM Sans (body)

## 📊 Konten Kuis (Built-in)

1. **K3 & Keselamatan Kerja** — 10 soal · 15 menit · Passing: 70%
2. **Orientasi Perusahaan** — 8 soal · 10 menit · Passing: 75%  
3. **Digital & Cyber Security** — 7 soal · 12 menit · Passing: 80%

---

> Dibuat untuk keperluan edukasi & pengembangan sistem LMS internal perusahaan.
