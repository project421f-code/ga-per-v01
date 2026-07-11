# 🏢 GA Performance Dashboard

> Sistem Digitalisasi Operasional General Affair (GA) — Dashboard Manajemen Tiket, Aset, Survey Stakeholder, & Pengelolaan Kos Karyawan.

Aplikasi ini adalah sistem monitoring dan manajemen operasional GA yang mencakup 4 departemen: **Maintenance**, **Housekeeping**, **Security**, dan **Cleaning Service**, serta modul **Asset Inventory** dan **Pengelolaan Kos Karyawan**.

---

## 🌐 Deploy Status

Aplikasi sudah aktif dan berjalan di:

| Mode | URL |
|:----|:----|
| **Demo (tanpa login)** | [`https://project421f-code.github.io/ga-per-v01/?demo=1`](https://project421f-code.github.io/ga-per-v01/?demo=1) |
| **Login Firebase** | [`https://project421f-code.github.io/ga-per-v01/`](https://project421f-code.github.io/ga-per-v01/) |
| **Repository GitHub** | [`https://github.com/project421f-code/ga-per-v01`](https://github.com/project421f-code/ga-per-v01) |

---

## 🏗️ Arsitektur

```
┌──────────────────────┐         fetch() HTTP          ┌──────────────────────────┐
│                      │ ────────────────────────────── │                          │
│   GitHub Pages       │                                │   Google Apps Script     │
│   (React SPA)        │ ────────────────────────────── │   (REST API Backend)     │
│                      │   Firebase Auth (browser SDK)  │                          │
└──────────────────────┘                                └──────────┬───────────────┘
                                                                    │
                                                             ┌──────▼────────┐
                                                             │ Google Sheets  │
                                                             │ (Database)     │
                                                             └───────────────┘
```

### Komponen Utama:
- **Frontend**: React + TypeScript + Vite (deploy ke GitHub Pages)
- **Autentikasi**: Firebase Authentication (email+password & Google SSO)
- **Database**: Google Sheets (diakses via Google Apps Script REST API)
- **Backend**: Google Apps Script (serverless, gratis)

---

## 🚀 Panduan Setup Lengkap

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/project421f-code/ga-per-v01.git
cd ga-per-v01
npm install
```

### 2. Setup Firebase Authentication

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **Create a project** (atau pilih project yang sudah ada)
3. Nonaktifkan Google Analytics (opsional)
4. Setelah project dibuat, klik **Authentication** di sidebar kiri
5. Klik **Get started**
6. Aktifkan 2 metode sign-in:
   - **Email/Password** → Enable → Save
   - **Google** → Enable → Configure project name & support email → Save
7. Klik **Project Settings** (icon gear) → **General**
8. Scroll ke **Your apps** → Klik **Add app** → **Web**
9. Beri nama app (misal: "GA Dashboard Web") → Klik **Register**
10. **Copy konfigurasi Firebase** (apiKey, authDomain, projectId, dll.)

### 3. Setup Google Apps Script & Google Sheets

1. Buat **Google Spreadsheet** baru di Google Drive
2. Buka menu **Extensions** → **Apps Script**
3. Ganti nama project menjadi "GA Dashboard Backend"
4. Copy seluruh isi file `Code.gs` dari repository ini
5. Paste ke editor Apps Script (timpa `function myFunction()`)
6. Simpan (Ctrl+S)
7. Klik **Deploy** → **New Deployment**
8. Pilih **Type**: Web App
9. **Description**: "GA Dashboard API"
10. **Execute as**: `Me` (akun Google Anda)
11. **Who has access**: `Anyone` (dibatasi oleh Firebase Auth)
12. Klik **Deploy**
13. **Ijinkan** akses (klik Review Permissions → pilih akun → Allow)
14. **Copy URL Web App** (contoh: `https://script.google.com/macros/s/xxx/exec`)

#### Inisialisasi Sheets
Jalankan fungsi `initializeSheets()` di editor Apps Script untuk membuat struktur sheets otomatis:
1. Di editor Apps Script, pilih fungsi `initializeSheets` dari dropdown
2. Klik **Run**
3. Cek Spreadsheet Anda—9 sheets baru akan muncul dengan header yang sesuai

> **Opsional**: Set Gemini API Key untuk fitur AI Advisor
> Di Apps Script editor: File → Project Properties → Script Properties → Add property
> - Property: `GEMINI_API_KEY`
> - Value: `YOUR_GEMINI_API_KEY`
> - Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan konfigurasi yang didapat dari langkah sebelumnya:

```env
# Firebase Config (dari Project Settings → Your apps → Web)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Google Apps Script URL (dari Deploy → Web App)
VITE_GAS_WEBAPP_URL=https://script.google.com/macros/s/your-script-id/exec
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Akses di `http://localhost:5173`. Aplikasi akan berjalan dalam **mode demo** (menggunakan mock data) sampai Firebase dan GAS dikonfigurasi di `.env`.

### 6. Build & Deploy ke GitHub Pages

#### A. Setup Repository
```bash
# Buat repository baru di GitHub
# Lalu remote ke repository Anda
git remote add origin https://github.com/project421f-code/ga-per-v01.git
```

#### B. Update `vite.config.ts`
```ts
base: process.env.NODE_ENV === 'production' ? '/ga-per-v01/' : '/',
```

#### C. Update `package.json`
```json
"homepage": "https://project421f-code.github.io/ga-per-v01"
```

#### D. Deploy
```bash
npm run deploy
```

GitHub Pages akan aktif di: `https://project421f-code.github.io/ga-per-v01`

---

### ⚡ Mode Demo Langsung

Anda bisa langsung mengakses aplikasi tanpa login melalui:
```
https://project421f-code.github.io/ga-per-v01/?demo=1
```

---

## 🔧 Fitur Aplikasi

| Modul | Deskripsi |
|-------|-----------|
| **📱 Dashboard** | Papan pantau real-time tiket, KPI, SLA, dan aktivitas live |
| **📋 Survey Stakeholder** | Form penilaian bulanan untuk 5 departemen GA |
| **📦 Asset & Stock Opname** | Manajemen aset, jadwal opname, dan rekonsiliasi selisih |
| **🏠 Pengelolaan Kos** | Cek-in/out penghuni, pembayaran sewa, laporan keuangan |
| **📄 Dokumen PRD** | Dokumentasi spesifikasi produk lengkap |
| **🤖 AI Advisor** | Analisis operasional berbasis Gemini AI |

---

## 🔐 Autentikasi

- **Manual (Email + Password)**: Registrasi dan login via Firebase Auth
- **Google SSO**: Login satu klik dengan akun Google
- **Mode Demo**: Akses tanpa login via `?demo=1` di URL

---

## 🧰 Teknologi

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons
- **Auth**: Firebase Authentication (gratis)
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **AI**: Google Gemini API (opsional)
- **Deploy**: GitHub Pages

---

## 📝 Lisensi

MIT License — Silakan gunakan, modifikasi, dan distribusikan sesuai kebutuhan.
