# 🏡 RumahKu — Sistem Operasi Keluarga Modern

![Version](https://img.shields.io/badge/version-1.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Status](https://img.shields.io/badge/status-active-success.svg)

**RumahKu** adalah platform manajemen keluarga all-in-one yang dirancang untuk membantu keluarga mengelola keuangan, jadwal makan, penyimpanan dokumen, dan kolaborasi rumah tangga dalam satu antarmuka yang elegan dan terstruktur.

Dibangun dengan teknologi web modern untuk performa cepat dan pengalaman pengguna yang mulus.

---

## ✨ Fitur Unggulan

### 💰 Manajemen Keuangan (Finance)
* **Budgeting:** Buat dan kelola kategori anggaran bulanan.
* **Transaksi:** Catat pemasukan dan pengeluaran dengan dukungan multi-wallet/bank.
* **Laporan:** Visualisasi kondisi keuangan dengan grafik interaktif.
* **Limitasi Tier:** Batasan jumlah akun dan kategori berdasarkan level langganan.

### 🍳 Dapur & Makanan (Kitchen)
* **Resep:** Simpan dan kelola resep masakan favorit keluarga.
* **Meal Planner:** Rencanakan menu makan mingguan atau bulanan agar lebih teratur.
* **Daftar Belanja:** Generate daftar belanja otomatis berdasarkan rencana makan.

### 🔐 Brankas Digital (Vault)
* Penyimpanan aman untuk dokumen penting keluarga (KK, Akta, Sertifikat, dll).
* Terintegrasi langsung dengan Supabase Storage untuk keamanan data.

### 💎 Sistem Berlangganan (Subscription)
Sistem *tiering* lengkap untuk kebutuhan keluarga yang berbeda:
* **Free Tier:** Fitur dasar (Max 1 akun bank, 3 kategori budget).
* **Family Tier (Rp 20.000/bln):** Unlimited akun/kategori, akses penuh fitur Dapur & Vault, kolaborasi multi-user.
* **Premium Tier (Rp 100.000/bln):** Semua fitur Family + Analytics prioritas, support khusus, dan ekspor data.

### 🛡️ Admin Dashboard
Panel kontrol khusus untuk administrator aplikasi:
* **User Management:** Kelola pengguna, pantau aktivitas, dan ubah tier langganan manual.
* **Subscription Analytics:** Monitor MRR (Monthly Recurring Revenue), pertumbuhan pelanggan, dan statistik paket.
* **Content Management:** Kelola FAQ, Testimonial, dan konten website lainnya tanpa coding.

---

## 🛠️ Tech Stack

Project ini dibangun menggunakan stack modern untuk performa maksimal dan kemudahan pengembangan:

* **Frontend Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
* **State Management:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
* **Form Handling:** React Hook Form + Zod Validation
* **Routing:** React Router DOM
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
* **Icons:** Lucide React
* **Charts:** Recharts

---

## 🚀 Cara Menjalankan Secara Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer lokal Anda:

### 1. Persiapan (Prerequisites)
Pastikan Anda sudah menginstal:
* Node.js (v18 atau lebih baru)
* NPM (bawaan Node.js) atau Bun

### 2. Clone Repository
```bash
git clone [https://github.com/athadiary21/Rumahku.git](https://github.com/athadiary21/Rumahku.git)
cd Rumahku
```

### 3. Install Dependencies
````Bash
npm install
# atau jika menggunakan bun
bun install
````

### 4. Konfigurasi Environment Variables
Duplikat file .env.example menjadi .env dan isi dengan kredensial Supabase Anda:

```Bash
cp .env.example .env
Isi file .env dengan data dari dashboard Supabase project Anda:
```

### Cuplikan kode

```
VITE_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

# Payment Gateways (Opsional untuk development awal)

```
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
VITE_XENDIT_API_KEY=your_xendit_api_key
```

### 5. Setup Database (Supabase)
Aplikasi ini membutuhkan struktur tabel tertentu. Jika Anda memiliki Supabase CLI:

```Bash
supabase link --project-ref your-project-ref
supabase db push
Alternatif: Salin script SQL dari folder supabase/migrations/ dan jalankan di SQL Editor dashboard Supabase Anda secara berurutan.
```

### 6. Jalankan Aplikasi
```Bash
npm run dev
Buka browser dan akses alamat yang muncul (biasanya http://localhost:5173).
```

# 📂 Struktur Proyek
```
/
├── public/              # Aset statis (favicon, robots.txt, manifest)
├── src/
│   ├── components/      # Komponen UI
│   │   ├── ui/          # Komponen dasar (Button, Input, Dialog, dll)
│   │   ├── finance/     # Komponen fitur keuangan
│   │   ├── recipes/     # Komponen fitur resep
│   │   └── ...
│   ├── contexts/        # React Context (Auth, Subscription, Language)
│   ├── hooks/           # Custom React Hooks (useMobile, useToast, dll)
│   ├── integrations/    # Konfigurasi client Supabase
│   ├── lib/             # Utility functions (utils.ts)
│   ├── pages/           # Halaman aplikasi (Routing views)
│   │   ├── admin/       # Halaman khusus Admin Panel
│   │   └── dashboard/   # Halaman Dashboard User (Finance, Family, dll)
│   ├── services/        # Logika bisnis & API calls
│   └── App.tsx          # Main Entry point & Routing setup
├── supabase/
│   ├── functions/       # Edge Functions (Backend logic)
│   └── migrations/      # Skema Database SQL
└── ...config files
```

# 🔒 Keamanan & Akses
Authentication: Menggunakan Supabase Auth (Email & Google OAuth).

Authorization: Menggunakan RLS (Row Level Security) di level database PostgreSQL. Data pengguna terisolasi dan hanya bisa diakses oleh pemiliknya atau anggota keluarga yang sah.

Role Based Access: Area Admin dilindungi middleware yang memverifikasi role user di tabel user_roles.

# 🤝 Kontribusi
Kontribusi sangat diterima! Silakan fork repository ini dan buat Pull Request untuk fitur baru atau perbaikan bug.

Fork Project

Buat Feature Branch (git checkout -b feature/FiturKeren)

Commit Changes (git commit -m 'Menambahkan FiturKeren')

Push ke Branch (git push origin feature/FiturKeren)

Buka Pull Request

# 👤 Kontak Developer
Athadiary21

Whatsapp: +62 82241590417

GitHub: athadiary21

Portfolio: https://athadiary.my.id

Dibuat dengan ❤️ untuk keluarga Indonesia.
