🏡 RumahKu — Sistem Operasi Keluarga

Elegan • Terstruktur • Siap untuk Kolaborasi

Repository: https://github.com/athadiary21/Rumahku

✨ Ringkasan Singkat

RumahKu adalah aplikasi web modern yang berfungsi sebagai Sistem Operasi Keluarga — tempat mengelola jadwal, aktivitas, catatan, dan kebutuhan rumah tangga dalam satu platform rapi dan mudah digunakan.

🧩 Tech Stack

Frontend: Next.js / React

Backend / Database: Supabase

Auth: Supabase Auth + Google OAuth

Styling: TailwindCSS (opsional)

📁 Struktur Proyek (perkiraan)
/public             → aset statis
/src
  /components       → komponen UI
  /pages atau /app  → routing (Next.js)
  /styles           → stylesheet


Jika ingin dibuat versi struktur asli berdasarkan repo-mu, cukup beri tahu saya.

🛠️ Cara Menjalankan Secara Lokal
# clone repo
git clone https://github.com/athadiary21/Rumahku
cd Rumahku

# install dependencies
npm install

# buat file .env.local lalu isi:
NEXT_PUBLIC_SUPABASE_URL=your_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key


NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx

GOOGLE_CLIENT_SECRET=yyyy

# jalankan development
npm run dev


Akses lokal:
http://localhost:3000

🔐 Catatan Google OAuth

Pastikan redirect URL berikut didaftarkan di Google Cloud Console:

Development
http://localhost:3000/api/auth/callback/google


(Jika suatu saat kamu menambah domain produksi, tinggal ditambahkan ke daftar.)

🛡️ Checklist Keamanan & Kualitas

 Audit dependency (npm audit)

 Pastikan .env tidak ikut ter-commit

 Gunakan Supabase RLS (Row Level Security)

 Tambahkan validasi input pada form

 Tambahkan schema validation (Zod / Yup)

 Tambahkan linting & formatting (ESLint + Prettier)

📌 TODO Utama

Integrasi Google Sign-In sepenuhnya

Membuat dashboard UI

Implementasi modul Aktivitas Keluarga

Koneksi ke database Supabase (Realtime / CRUD)

Menambahkan sistem traffic log / activity log user

Menambahkan dokumentasi API (opsional)

🧯 Troubleshooting
Login Error: 400 redirect_uri_mismatch

Pastikan URL redirect sudah benar dan terdaftar.

404 pada aset atau gambar

Periksa folder /public

Pastikan nama file case-sensitive

Error SSR atau komponen tidak dirender

Cek console di browser & terminal

Pastikan tidak ada import yang salah path

📦 License

MIT (opsional)

👤 Kontak Developer

Dibuat oleh Atha
Jika butuh bantuan coding, arsitektur, database, atau UI—tinggal panggil saya 😊
