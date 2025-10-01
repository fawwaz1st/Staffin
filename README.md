# Staffin – Modern Workforce Management Platform

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node.js-18+-68A063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistem manajemen karyawan end-to-end berbasis **Laravel 12** dan **React + Vite** dengan desain modern bernuansa cafe. Staffin membantu tim HR mengelola karyawan, shift, absensi, cuti, dan payroll dari satu dashboard intuitif.

---

## 📋 Daftar Isi
- [Fitur Utama](#fitur-utama)
- [Sorotan UI](#sorotan-ui)
- [Arsitektur & Teknologi](#arsitektur--teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Mulai Cepat](#mulai-cepat)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Konfigurasi Lingkungan](#konfigurasi-lingkungan)
  - [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Perintah Penting](#perintah-penting)
- [API Ringkas](#api-ringkas)
- [Sistem Desain](#sistem-desain)
- [Testing & QA](#testing--qa)
- [Roadmap](#roadmap)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Dukungan](#dukungan)

---

## Fitur Utama
* __Manajemen Karyawan__ – CRUD karyawan, status `pending/approved/rejected`, ringkasan cepat.
* __Penjadwalan Shift__ – Filter cerdas (rentang tanggal, status, karyawan), polling 30 detik.
* __Absensi Real-time__ – Monitoring clock-in/out, export CSV, pagination responsif.
* __Pengajuan Cuti__ – Tabel "Pengajuan Cuti Terbaru" dengan tombol aksi hover lembut.
* __Payroll & Analitik__ – Placeholder siap integrasi payroll + grafik kehadiran.
* __UI Adaptif__ – Tema terang/gelap, glassmorphism ringan, tipografi jelas.
* __Keamanan__ – Sanctum SPA, middleware role admin, layer service untuk audit.

## Sorotan UI
```
resources/
├── js/
│   ├── components/   # Card, Modal, StatCard, UserCard, RoleDropdown, dsb.
│   ├── layouts/      # AdminLayout.tsx, header, bottom-nav mobile
│   ├── pages/        # Dashboard, Users, Shifts, Attendance, Auth
│   └── css/app.css   # Token warna & tema Tailwind v4
└── views/app.blade.php
```
> Filter Shift, kartu user, dan tombol cuti memakai efek blur + border lembut. Dropdown custom dengan ikon chevron menyatu di tema apa pun.

## Arsitektur & Teknologi
* **Backend:** Laravel 12, Sanctum, Eloquent ORM, Service Layer (`AttendanceService`, `ShiftService`).
* **Frontend:** React 19, Vite, React Router, Tailwind CSS token custom, Recharts.
* **Build Tools:** ESLint, Prettier, PostCSS, TSConfig untuk alias `@/*`.
* **Database:** MySQL 8+ (migrasi & seeder tersedia).

## Struktur Proyek
```
staffin/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   └── Services/
├── resources/
│   ├── js/
│   └── css/
├── database/
│   ├── migrations/
│   └── seeders/
└── tests/
```

## Mulai Cepat

### Prasyarat
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8+

### Instalasi
```bash
git clone <repository-url>
cd Staffin
composer install
npm install
```

### Konfigurasi Lingkungan
```bash
cp .env.example .env
php artisan key:generate
```
Sesuaikan `.env` (database, mail, Sanctum stateful domain).

### Menjalankan Aplikasi
```bash
php artisan migrate --seed
php artisan serve
npm run dev
```
Akses: [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Perintah Penting
```bash
php artisan test
npm run lint
npm run build
```

## API Ringkas
| Endpoint | Metode | Deskripsi |
| --- | --- | --- |
| `/session/login` | POST | Autentikasi SPA |
| `/api/dashboard/admin/summary` | GET | Ringkasan admin |
| `/api/shifts` | CRUD | Kelola shift (admin) |
| `/api/attendance` | GET | Absensi admin |
| `/api/admin/users` | GET | Manajemen user |

> Endpoint admin di-protect `auth:sanctum` + `role:admin`. Rate limit 5/minute untuk clock-in/out karyawan.

## Sistem Desain
* **Warna:** nuansa coffee, cream, emerald, rose.
* **Komponen Reusable:** `Button`, `IconButton`, `Card`, `Modal`, `StatusBadge`, `RoleDropdown`, `AdminHeader`.
* **Tema Dinamis:** `ThemeToggle` menyimpan preferensi lokal & mengikuti OS.
* **Glassmorphism:** Filter Shift, kartu user, & tombol cuti.

## Testing & QA
* `php artisan test`
* `npm run lint`
* `npm run build`
* Hook `useFetch` menggunakan `AbortController` & memo untuk mencegah infinite loading.

## Catatan Pembaruan
* __2025-10-01__ – Dashboard admin kini mengambil data real-time via endpoint `GET /api/dashboard/admin/summary`, meliputi ringkasan kehadiran mingguan, distribusi status cuti, dan tabel pengajuan terbaru langsung dari database.
* __2025-10-01__ – Badge notifikasi di sidebar & bottom nav kini memanfaatkan data notifikasi per fitur (users, shifts, attendance, leaves, payroll) sehingga ikon lonceng di topbar dihapus dan digantikan indikator per menu.

## Roadmap
* Integrasi data real dashboard.
* Modul payroll otomatis.
* Notifikasi email/WhatsApp.
* Multi bahasa.

## Kontribusi
1. Fork repo.
2. `git checkout -b feature/nama-fitur`
3. Commit: `feat: deskripsi singkat`
4. Push & buka Pull Request dengan ringkasan + screenshot UI.

## Lisensi
Staffin dilisensikan di bawah [MIT License](LICENSE).

## Dukungan
* Buat issue di GitHub jika menemukan bug/fitur yang diperlukan.
* Kontak: `support@staffin.fake` (ganti dengan email tim Anda).

