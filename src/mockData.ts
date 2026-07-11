import { Task, Team, TaskStatus, Priority, ActivityLog, AssetItem, OpnameSchedule, OpnameLog, KosHouse, KosRoom, KosPayment } from "./types";

// Generates realistic date ISO strings relative to now
const hoursAgo = (h: number): string => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

const daysAgo = (dNum: number, h: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - dNum);
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

export const initialTasks: Task[] = [
  // MAINTENANCE TEAM
  {
    id: "MNT-101",
    title: "AC Bocor di Ruang Rapat Jayakarta",
    description: "Semburan air menetes deras dari indoor unit AC Daikin 2 PK, berisiko merusak meja kayu dan karpet ruang rapat utama.",
    team: Team.MAINTENANCE,
    reporter: "Siti Rahma (HR Admin)",
    location: "Ruang Rapat Jayakarta (Lt. 3)",
    priority: Priority.HIGH,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(3, 4),
    updatedAt: daysAgo(3, 1),
    completedAt: daysAgo(3, 1),
    slaMinutes: 120, // 2 hours
    actualMinutes: 95,
    feedbackRating: 5,
  },
  {
    id: "MNT-102",
    title: "Lampu Lorong Lift Lt. 2 Padam",
    description: "Tiga buah lampu downlight mati total di area lorong utama lift penumpang lantai 2.",
    team: Team.MAINTENANCE,
    reporter: "Andi Wijaya (Internal)",
    location: "Area Lift (Lt. 2)",
    priority: Priority.MEDIUM,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(2, 6),
    updatedAt: daysAgo(2, 4),
    completedAt: daysAgo(2, 4),
    slaMinutes: 240, // 4 hours
    actualMinutes: 180,
    feedbackRating: 4,
  },
  {
    id: "MNT-103",
    title: "Pintu Kaca Utama Seret & Menggesek Lantai",
    description: "Engsel pintu kaca tempered geser sisi barat mengeluarkan suara berdecit keras dan sulit didorong penuh.",
    team: Team.MAINTENANCE,
    reporter: "Syaiful (Security)",
    location: "Lobby Utama (Lt. 1)",
    priority: Priority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(1),
    slaMinutes: 180,
  },
  {
    id: "MNT-104",
    title: "Kerusakan Saklar Listrik Pantry",
    description: "Saklar dispenser air mengeluarkan cipratan api kecil saat ditekan tombol on/off.",
    team: Team.MAINTENANCE,
    reporter: "Yuli (Finance)",
    location: "Pantry Bersama (Lt. 4)",
    priority: Priority.HIGH,
    status: TaskStatus.PENDING,
    createdAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.5),
    slaMinutes: 60,
  },
  {
    id: "MNT-105",
    title: "Pengecekan Rutin Generator Set (Genset)",
    description: "Maintenance preventif bulanan, penggantian oli filter, cek aki starter, dan uji coba load generator 500 kVA.",
    team: Team.MAINTENANCE,
    reporter: "Rudi Santoso (GA Supervisor)",
    location: "Rumah Genset Belakang",
    priority: Priority.MEDIUM,
    status: TaskStatus.COMPLETED,
    createdAt: daysAgo(1, 8),
    updatedAt: daysAgo(1, 3),
    completedAt: daysAgo(1, 3),
    slaMinutes: 300,
    actualMinutes: 270,
    feedbackRating: 5,
  },

  // HOUSEKEEPING TEAM
  {
    id: "HKP-201",
    title: "Set-up Ruang Auditorium untuk Townhall",
    description: "Persiapan 150 kursi baris, penataan panggung kecil, meja podium, kelengkapan cover meja VIP, serta standing banner.",
    team: Team.HOUSEKEEPING,
    reporter: "Budi Santoso (Corporate Comm)",
    location: "Auditorium Serbaguna (Lt. 5)",
    priority: Priority.HIGH,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(2, 5),
    updatedAt: daysAgo(2, 1),
    completedAt: daysAgo(2, 1),
    slaMinutes: 180,
    actualMinutes: 150,
    feedbackRating: 5,
  },
  {
    id: "HKP-202",
    title: "Stok Ulang Air Galon Ruangan Direksi",
    description: "Pengiriman 4 galon air mineral baru dan penggantian dispenser di koridor direksi.",
    team: Team.HOUSEKEEPING,
    reporter: "Amelia (Sekretaris)",
    location: "Selasar Direksi (Lt. 4)",
    priority: Priority.LOW,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(1, 4),
    updatedAt: daysAgo(1, 3),
    completedAt: daysAgo(1, 3),
    slaMinutes: 60,
    actualMinutes: 45,
    feedbackRating: 5,
  },
  {
    id: "HKP-203",
    title: "Pembersihan Karpet Pasca Konstruksi Pantry",
    description: "Deep vacuuming dan sikat basah karpet koridor lt. 4 karena noda sisa semen instalasi pipa pantry.",
    team: Team.HOUSEKEEPING,
    reporter: "Rudi Santoso (GA Supervisor)",
    location: "Koridor Pantry (Lt. 4)",
    priority: Priority.MEDIUM,
    status: TaskStatus.PENDING,
    createdAt: hoursAgo(1.5),
    updatedAt: hoursAgo(1.5),
    slaMinutes: 360,
  },
  {
    id: "HKP-204",
    title: "Penyemprotan Disinfektan Kamar Mandi Utama",
    description: "Fogging dan disinfeksi higienis mingguan untuk seluruh bilik toilet lobi dan gedung sayap barat.",
    team: Team.HOUSEKEEPING,
    reporter: "Yusuf (Internal)",
    location: "Gedung Barat (Lobi & Toilet)",
    priority: Priority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(0.2),
    slaMinutes: 120,
  },

  // SECURITY TEAM
  {
    id: "SEC-301",
    title: "Penertiban Parkir Liar Motor di Jalur Damkar",
    description: "Melakukan penertiban dan pemasangan gembok roda bagi 5 sepeda motor yang parkir di area steril pemadam kebakaran (fire lane).",
    team: Team.SECURITY,
    reporter: "Syaiful (Danru Security)",
    location: "Area Parkir Timur (Outdoors)",
    priority: Priority.HIGH,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(1, 10),
    updatedAt: daysAgo(1, 9),
    completedAt: daysAgo(1, 9),
    slaMinutes: 30,
    actualMinutes: 20,
    feedbackRating: 5,
  },
  {
    id: "SEC-302",
    title: "Pengecekan Sistem Detektor Asap Koridor Lt. 3",
    description: "Pengawalan pengujian sensor alarm kebakaran bersama vendor eksternal di ruang server dan koridor lt.3.",
    team: Team.SECURITY,
    reporter: "Syaiful (Danru Security)",
    location: "Gedung Utama (Lt. 3)",
    priority: Priority.MEDIUM,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(2, 8),
    updatedAt: daysAgo(2, 6),
    completedAt: daysAgo(2, 6),
    slaMinutes: 180,
    actualMinutes: 140,
    feedbackRating: 4,
  },
  {
    id: "SEC-303",
    title: "Kartu Akses Pengunjung (Visitor Badge) Hilang",
    description: "Pemeriksaan CCTV dan wawancara resepsionis terkait laporan kartu akses nomor #42 yang hilang oleh kontraktor IT.",
    team: Team.SECURITY,
    reporter: "Dewi (Resepsionis)",
    location: "Lobby Resepsionis (Lt. 1)",
    priority: Priority.MEDIUM,
    status: TaskStatus.COMPLETED,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(2),
    completedAt: hoursAgo(2),
    slaMinutes: 180,
    actualMinutes: 160,
    feedbackRating: 4,
  },
  {
    id: "SEC-304",
    title: "Insiden Pencurian Helm di Area Parkir B1",
    description: "Pemeriksaan rekaman CCTV CCTV-Parking-04 karena keluhan helm AGV hilang di parkiran basemen sub-area C3.",
    team: Team.SECURITY,
    reporter: "Zulkifli (Karyawan Sales)",
    location: "Basement Parkir B1 (Area C3)",
    priority: Priority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    createdAt: hoursAgo(1.2),
    updatedAt: hoursAgo(0.5),
    slaMinutes: 120,
  },

  // CLEANING SERVICE TEAM
  {
    id: "CLS-401",
    title: "Tumpahan Kopi Luwak di Koridor Lt. 3",
    description: "Pembersihan cepat tumpahan kopi di karpet utama dekat meja resepsionis lt. 3, agar tidak berbekas permanen.",
    team: Team.CLEANING_SERVICE,
    reporter: "Hani (Sales Admin)",
    location: "Koridor Resepsionis (Lt. 3)",
    priority: Priority.HIGH,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(1, 2),
    updatedAt: daysAgo(1, 1.8),
    completedAt: daysAgo(1, 1.8),
    slaMinutes: 20, // 20 minutes SLA
    actualMinutes: 12,
    feedbackRating: 5,
  },
  {
    id: "CLS-402",
    title: "Deep Cleaning Toilet Pria Lt. 1 (Lobi)",
    description: "Penyikatan kerak lantai, wastafel, urinoar, pembersihan cermin, refill sabun cuci tangan, dan pewangi ruangan toilet lobi.",
    team: Team.CLEANING_SERVICE,
    reporter: "Rudi Santoso (GA Supervisor)",
    location: "Toilet Lobi Utama (Lt. 1)",
    priority: Priority.MEDIUM,
    status: TaskStatus.VERIFIED,
    createdAt: daysAgo(2, 2),
    updatedAt: daysAgo(2, 1),
    completedAt: daysAgo(2, 1),
    slaMinutes: 90,
    actualMinutes: 75,
    feedbackRating: 5,
  },
  {
    id: "CLS-403",
    title: "Pengosongan Tempat Sampah Seluruh Pantry Lt. 1-5",
    description: "Pengangkutan kantong sampah hitam sisa catering makan siang karyawan ke TPS pusat di belakang gedung.",
    team: Team.CLEANING_SERVICE,
    reporter: "Andi Wijaya (Internal)",
    location: "Gedung Utama (Seluruh Pantry)",
    priority: Priority.MEDIUM,
    status: TaskStatus.PENDING,
    createdAt: hoursAgo(0.4),
    updatedAt: hoursAgo(0.4),
    slaMinutes: 45,
  },
  {
    id: "CLS-404",
    title: "Pembersihan Kaca Jendela Luar Resepsionis",
    description: "Pembersihan bercak noda hujan dan sidik jari pada kaca luar fasad lobi utama.",
    team: Team.CLEANING_SERVICE,
    reporter: "Syaiful (Security)",
    location: "Lobby Utama (Lt. 1)",
    priority: Priority.LOW,
    status: TaskStatus.IN_PROGRESS,
    createdAt: hoursAgo(1.1),
    updatedAt: hoursAgo(0.3),
    slaMinutes: 120,
  }
];

export const initialLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    taskId: "MNT-101",
    team: Team.MAINTENANCE,
    actor: "Siti Rahma (HR Admin)",
    action: "Membuat Tiket",
    timestamp: daysAgo(3, 4),
    details: "AC Bocor di Ruang Rapat Jayakarta dilaporkan karena air menetes membasahi meja rapat utama.",
  },
  {
    id: "LOG-002",
    taskId: "MNT-101",
    team: Team.MAINTENANCE,
    actor: "Iwan (Teknisi Maintenance)",
    action: "Memulai Pengerjaan",
    timestamp: daysAgo(3, 3.5),
    details: "Mempersiapkan tangga, vacuum pump, dan ember penampung sementara di lokasi.",
  },
  {
    id: "LOG-003",
    taskId: "MNT-101",
    team: Team.MAINTENANCE,
    actor: "Iwan (Teknisi Maintenance)",
    action: "Menyelesaikan Tiket",
    timestamp: daysAgo(3, 1),
    details: "Pembersihan pipa pembuangan (drainage) yang mampet karena lendir, AC sudah di-test run dingin stabil.",
  },
  {
    id: "LOG-004",
    taskId: "MNT-101",
    team: Team.MAINTENANCE,
    actor: "Siti Rahma (HR Admin)",
    action: "Verifikasi Tiket",
    timestamp: daysAgo(3, 1),
    details: "Memberikan rating bintang 5. Respon cepat dan pengerjaan rapi tanpa mengotori ruang rapat.",
  },
  {
    id: "LOG-005",
    taskId: "CLS-401",
    team: Team.CLEANING_SERVICE,
    actor: "Hani (Sales Admin)",
    action: "Membuat Tiket",
    timestamp: daysAgo(1, 2),
    details: "Tumpahan Kopi Luwak dilaporkan dekat resepsionis lt. 3.",
  },
  {
    id: "LOG-006",
    taskId: "CLS-401",
    team: Team.CLEANING_SERVICE,
    actor: "Supri (Cleaning Staff)",
    action: "Menyelesaikan Tiket",
    timestamp: daysAgo(1, 1.8),
    details: "Karpet dibersihkan menggunakan chemical spot-cleaner khusus, sisa noda coklat hilang sempurna.",
  },
  {
    id: "LOG-007",
    taskId: "SEC-301",
    team: Team.SECURITY,
    actor: "Syaiful (Danru Security)",
    action: "Menyelesaikan Tiket",
    timestamp: daysAgo(1, 9),
    details: "Pemasangan wheel lock gembok ban dan penempelan stiker peringatan bagi motor pelanggar marka damkar.",
  }
];

export const prdSections = [
  {
    id: "latar-belakang",
    title: "1. Latar Belakang & Masalah",
    icon: "FileText",
    content: `
### 🏢 Latar Belakang
General Affair (GA) merupakan tulang punggung operasional fasilitas perusahaan yang memastikan seluruh ekosistem kerja berjalan produktif, aman, dan nyaman. Pengelolaan fasilitas ini dilakukan melalui empat tim operasional inti:
1. **Maintenance (Pemeliharaan)**: Bertanggung jawab atas ketersediaan utilitas listrik, AC, bangunan, lift, saklar, genset, dan infrastruktur fisik lainnya.
2. **Housekeeping (Kerumahtanggaan)**: Bertanggung jawab atas pengelolaan stok, air minum, setup layout ruang rapat/audit, penataan taman, dan logistik kantor.
3. **Security (Keamanan)**: Menjamin keamanan fisik aset, pengawasan area parkir, patroli malam rutin, penerbitan tanda pengenal, dan penanganan insiden darurat.
4. **Cleaning Service (Kebersihan)**: Bertanggung jawab atas sanitasi toilet, kebersihan lantai, penanganan cepat tumpahan (spill management), sampah pantry, dan estetika area publik.

### 🛑 Masalah Utama Sistem Manual Saat Ini
* **Monitoring Pekerjaan Terhambat**: Sulit memantau aktivitas lapangan secara real-time. Manajemen tidak mengetahui apakah tim sedang keliling, menyelesaikan kendala, atau sedang idle.
* **Fragmentasi Data (Data Silo)**: Pelaporan dan pencatatan pekerjaan tersebar di berbagai saluran tidak teratur (grup WhatsApp, buku log fisik, email, atau instruksi verbal langsung).
* **Perhitungan KPI Manual**: Penilaian performa tim (seperti Service Level Agreement / SLA, waktu respons, tingkat penyelesaian tiket, dan kepuasan pengguna / CSAT) dihitung secara manual setiap akhir bulan menggunakan Excel, rawan manipulasi dan kesalahan hitung.
* **Hambatan Analisis Improvement**: Manajemen kesulitan menganalisis tren kerusakan atau area yang membutuhkan pembenahan karena tidak adanya data historis yang terstruktur.
`
  },
  {
    id: "product-goals",
    title: "2. Tujuan Produk & Metrik KPI",
    icon: "Target",
    content: `
### 🎯 Tujuan Produk (Product Goals)
* **Digitalisasi Alur Kerja GA**: Memindahkan seluruh proses pelaporan, disposisi tugas, hingga penyelesaian masalah dari cara manual ke sistem digital yang terpusat.
* **Monitoring Real-Time**: Menyediakan papan pantau interaktif (*live dashboard*) yang memvisualisasikan status pekerjaan terkini dari keempat tim operasional lapangan.
* **Otomatisasi Perhitungan KPI**: Menghilangkan entri data manual dan kalkulator bulanan dengan menghitung secara otomatis parameter performa tim saat tiket diverifikasi oleh pelapor.
* **Penyediaan Analisis Operasional**: Memberikan rekam jejak lengkap berupa metrik performa historis, tren insiden, dan grafik kepatuhan SLA yang dapat dianalisis kapan saja.
* **Rekomendasi Berbasis AI**: Membuka jalan bagi program perbaikan operasional berkelanjutan (*Continuous Improvement*) dengan mengintegrasikan AI (*Gemini*) untuk menyusun analisis kendala dan rekomendasi strategis.

### 📊 Metrik Utama (Formula KPI Otomatis)
Aplikasi ini menerapkan standardisasi KPI operasional GA berikut:
1. **Tingkat Penyelesaian (Completion Rate)**:
   $$\\text{Completion Rate} = \\left( \\frac{\\text{Tiket Selesai + Terverifikasi}}{\\text{Total Tiket}} \\right) \\times 100\\%$$
2. **Kepatuhan SLA (SLA Compliance)**:
   $$\\text{SLA Compliance} = \\left( \\frac{\\text{Tiket Selesai Tepat Waktu (Durasi Actual} \\le \\text{Target SLA)}}{\\text{Total Tiket Selesai}} \\right) \\times 100\\%$$
3. **Waktu Respons Rata-rata (Average Response Time)**:
   Kalkulasi selisih waktu antara pembuatan tiket hingga tim mengubah status menjadi *In-Progress*.
4. **Skor Kepuasan Karyawan (CSAT)**:
   Rata-rata rating bintang (1-5) yang diisi oleh pelapor saat memverifikasi penyelesaian pekerjaan. Target standar perusahaan: **$\\ge 4.2$**.
`
  },
  {
    id: "user-personas",
    title: "3. Peran Pengguna & Hak Akses",
    icon: "Users",
    content: `
### 👤 Struktur Pengguna Sistem
Sistem ini dirancang dengan antarmuka adaptif untuk memfasilitasi tiga peran utama dalam ekosistem GA:

1. **GA Manager / Supervisor (Admin)**
   * **Wewenang**: Memantau dashboard performa lintas departemen secara makro, melihat tren analitik historis, mengakses sistem analisis AI Gemini, membuat tiket tugas besar/pencegahan preventif, dan mengaudit log seluruh tim.
   * **Kebutuhan**: Data instan yang akurat untuk laporan direksi dan penentuan sistem *Reward & Punishment*.

2. **Tim Operasional GA (Maintenance, Housekeeping, Security, Cleaning)**
   * **Wewenang**: Mengakses daftar pekerjaan (Job Board) khusus tim mereka, mengubah status tiket (menjadi *In-Progress* dan *Completed*), serta mengisi catatan detail hasil pengerjaan lapangan.
   * **Kebutuhan**: Antarmuka mobile-friendly yang ringkas, instruksi kerja yang jelas, navigasi lokasi, dan pelacakan target SLA individual agar kinerjanya tercatat objektif.

3. **Pelapor (Karyawan Perusahaan)**
   * **Wewenang**: Membuat laporan masalah fasilitas (tiket baru), melacak progres pengerjaan tiket milik mereka secara transparan, serta melakukan *Verifikasi* (menutup tiket) dengan memberikan rating kepuasan (CSAT 1-5 Bintang) serta ulasan umpan balik.
   * **Kebutuhan**: Form pelaporan yang cepat, notifikasi pembaruan status, dan jaminan tindak lanjut masalah.
`
  },
  {
    id: "fitur-utama",
    title: "4. Spesifikasi Fitur Utama",
    icon: "CheckSquare",
    content: `
### ⚙️ Alur Fitur Utama Aplikasi

#### A. Dashboard Real-Time & Visualisasi Data
* **Summary Scorecards**: Menampilkan metrik agregat CSAT, Kepatuhan SLA %, Kecepatan Respons, dan Rasio Penyelesaian Tiket dalam balutan warna indikator visual (Hijau = Bagus, Kuning = Peringatan, Merah = Kritis).
* **Tren Kinerja Tim (Interactive SVG Chart)**: Grafik batang performa perbandingan antar-departemen serta diagram lingkaran distribusi beban tiket aktif.
* **Field Activity Live Simulator**: Fitur simulasi interaktif yang menghasilkan kejadian lapangan otomatis secara acak (misal: AC bocor, tumpahan air, bohlam koridor mati). Berguna untuk mensimulasikan pemantauan langsung secara real-time.

#### B. Digital Job Board & Tiket (Kaban Board terpadu)
* **Kategori Tab Tim**: Pembagian alur kerja yang rapi untuk Maintenance, Housekeeping, Security, dan Cleaning Service.
* **Sistem Alur Status**: Tiket berpindah secara berurutan:
  * **Pending** (Masuk) $\\rightarrow$ **In-Progress** (Sedang dikerjakan oleh tim) $\\rightarrow$ **Completed** (Selesai pengerjaan fisik) $\\rightarrow$ **Verified** (Selesai total setelah dikonfirmasi & diberi rating oleh Karyawan).
* **Form Tiket Cepat**: Pengguna dapat menambahkan tiket baru dengan mengisi deskripsi, lokasi spesifik, penanggung jawab tim, prioritas, dan target SLA standar.

#### C. AI Operational Improvement Analyzer (Tenaga Gemini API)
* **Analisis Data Otomatis**: Backend Express mengirimkan statistik tim saat ini dan ringkasan riwayat log ke model **Gemini-3.5-flash**.
* **Laporan Konsultasi Instan**: AI mengekstrak pola kerusakan berulang (misal: AC paling sering bocor di lt. 3, toilet lt. 1 sering kotor) dan merumuskan saran stock suku cadang atau program preventif secara tertulis dalam hitungan detik.

#### D. Feed Activity Logs & Sistem Reward
* **Audit Trail Transparan**: Setiap aksi dicatat (siapa, melakukan apa, kapan) untuk mencegah perselisihan klaim pengerjaan.
* **Operational Leaderboard**: Menampilkan peringkat anggota tim atau departemen berdasarkan tingkat kepatuhan SLA tertinggi untuk mendasari sistem bonus / reward kinerja.
`
  },
  {
    id: "gas-architecture",
    title: "5. Detail Modul Google Apps Script (GAS)",
    icon: "SlidersHorizontal",
    content: `
### 🛠️ Arsitektur Integrasi Google Apps Script (GAS)
Untuk memastikan sistem dapat diimplementasikan secara murah, andal, dan terintegrasi penuh dengan ekosistem Google Workspace perusahaan, seluruh penyimpanan data (Database) dan pengiriman logika bisnis di-host menggunakan **Google Sheets** dan **Google Apps Script (GAS)** sebagai Backend Serverless.

---

### 💾 1. Skema Database (Google Sheets Structure)
Database akan dibuat dalam sebuah Google Spreadsheet dengan 3 lembar kerja (Sheet) utama:

#### A. Sheet \`Database_Tiket\`
Menyimpan seluruh data transaksi tiket. Setiap baris mewakili satu kejadian/tugas:
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`ID\` | String | ID unik (contoh: MNT-101, CLS-402) |
| \`Title\` | String | Judul kendala atau penugasan |
| \`Description\`| String | Deskripsi kerusakan atau instruksi kerja |
| \`Team\` | String | Enum: Maintenance, Housekeeping, Security, Cleaning Service |
| \`Reporter\` | String | Nama karyawan pelapor |
| \`Location\` | String | Lokasi fisik spesifik |
| \`Priority\` | String | Enum: High, Medium, Low |
| \`Status\` | String | Enum: Pending, In-Progress, Completed, Verified |
| \`CreatedAt\` | DateTime | ISO timestamp tanggal dibuat |
| \`UpdatedAt\` | DateTime | ISO timestamp pembaruan terakhir |
| \`CompletedAt\`| DateTime | ISO timestamp ketika status diubah ke Completed |
| \`SlaMinutes\` | Number | Target SLA penyelesaian dalam menit |
| \`ActualMinutes\`| Number | Durasi aktual pengerjaan (CompletedAt - CreatedAt) |
| \`Rating\` | Number | Nilai CSAT dari pelapor (1 - 5) |

#### B. Sheet \`Database_Logs\`
Mencatat seluruh rekam jejak aktivitas operasional untuk kebutuhan audit (*Audit Trail*):
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`LogID\` | String | ID unik log (contoh: LOG-10293) |
| \`TicketID\` | String | Referensi ke ID Tiket di Sheet \`Database_Tiket\` |
| \`Team\` | String | Kategori tim yang bersangkutan |
| \`Actor\` | String | Nama yang melakukan pembaruan status |
| \`Action\` | String | Jenis aksi (Membuat Tiket, Mulai Kerja, Selesai, Verifikasi) |
| \`Timestamp\` | DateTime | ISO timestamp pencatatan log |
| \`Details\` | String | Catatan keterangan rinci |

---

### 🌐 2. Web App API Endpoints (doGet & doPost)
Google Apps Script dideploy sebagai **Web App** dengan URL yang dapat diakses melalui metode HTTP GET/POST:

#### A. Logika \`doGet(e)\` (Membaca Data & KPI)
Digunakan untuk mengambil seluruh daftar tiket aktif dan ringkasan nilai metrik KPI ke aplikasi React secara instan:
\`\`\`javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Database_Tiket");
  var rows = sheet.getDataRange().getValues();
  var tickets = [];
  
  // Lewati baris header index 0
  for (var i = 1; i < rows.length; i++) {
    tickets.push({
      id: rows[i][0],
      title: rows[i][1],
      description: rows[i][2],
      team: rows[i][3],
      reporter: rows[i][4],
      location: rows[i][5],
      priority: rows[i][6],
      status: rows[i][7],
      createdAt: rows[i][8],
      updatedAt: rows[i][9],
      completedAt: rows[i][10],
      slaMinutes: rows[i][11],
      actualMinutes: rows[i][12],
      rating: rows[i][13]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    data: tickets 
  })).setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

#### B. Logika \`doPost(e)\` (Menulis / Update Status)
Digunakan untuk menangani aksi pembuatan tiket baru, perubahan status pekerjaan oleh teknisi, serta verifikasi rating CSAT oleh pelapor:
\`\`\`javascript
function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var action = params.action; // "CREATE", "START_WORK", "COMPLETE", "VERIFY"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Database_Tiket");
  
  if (action === "CREATE") {
    // Tambahkan baris baru di sheet Database_Tiket
    sheet.appendRow([
      params.id, params.title, params.description, params.team,
      params.reporter, params.location, params.priority, "Pending",
      new Date().toISOString(), new Date().toISOString(), "",
      params.slaMinutes, "", ""
    ]);
    
    // Kirim notifikasi email otomatis jika prioritas tinggi
    if (params.priority === "High") {
      sendHighPriorityNotification(params);
    }
  } 
  else if (action === "START_WORK") {
    updateTicketStatus(params.id, "In-Progress");
  } 
  else if (action === "COMPLETE") {
    // Set status ke Completed dan kalkulasi ActualMinutes otomatis
    markTicketAsCompleted(params.id);
  } 
  else if (action === "VERIFY") {
    // Simpan rating CSAT dan tutup tiket total
    verifyAndRateTicket(params.id, params.rating);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

---

### ✉️ 3. Modul Notifikasi & Trigger Otomatis (GmailApp)
Untuk menjamin responsivitas yang tinggi di lapangan, GAS diprogram untuk mengirimkan peringatan email langsung ke supervisor departemen terkait:

1. **Trigger Pembuatan Tiket HIGH-PRIORITY (Event-Driven)**:
   Saat tiket berkategori \`High\` ditambahkan, sistem GAS memanggil fungsi \`GmailApp.sendEmail()\` untuk langsung mengirimkan instruksi kerja darurat ke email PIC Tim Maintenance atau Security.
2. **Trigger Keterlambatan SLA (Time-Driven Trigger)**:
   Trigger yang berjalan otomatis setiap 1 jam untuk mendeteksi apakah ada tiket \`Pending\` atau \`In-Progress\` yang durasi waktunya telah melebihi target \`SlaMinutes\`. Jika terdeteksi, supervisor General Affair akan otomatis mendapatkan email eskalasi sistem untuk melakukan pengecekan lapangan langsung.

---

### 📈 4. Rumus Otomatisasi Performa GA (Custom Script Formula)
Agar data sheet dapat langsung dibaca sebagai laporan oleh pimpinan tanpa bantuan dashboard web, kita menanamkan formula kustom Apps Script (Custom Functions) berikut:

* **\`=HITUNG_CSAT_TIM(nama_tim)\`**: Menghitung rata-rata bintang kepuasan khusus departemen tertentu.
* **\`=HITUNG_EFISIENSI_SLA(nama_tim)\`**: Menghitung persentase kepatuhan pengerjaan tepat waktu terhadap target menit yang ditentukan perusahaan.
`
  },
  {
    id: "stakeholder-surveys-prd",
    title: "6. Modul Survey Stakeholder Bulanan",
    icon: "Users",
    content: `
### 📋 Modul Survey Kepuasan Stakeholder Bulanan
Sebagai bagian dari *Quality Control* dan penyelarasan kualitas pelayanan GA dengan kebutuhan para pimpinan divisi (Stakeholder Utama), aplikasi menyediakan modul survey kepuasan berkala (setiap bulan).

#### 🎯 Tujuan Survey
* **Umpan Balik Kualitatif**: Mendapatkan kritik dan saran tertulis yang spesifik dari manajer/direktur departemen lain mengenai kinerja harian GA.
* **Standardisasi KPI**: Nilai kepuasan dari survey bulanan ini berkontribusi langsung sebesar **40%** dalam bobot KPI Gabungan Bulanan GA, mendampingi data performa SLA operasional harian (60%).

#### 📊 Mekanisme Penilaian Survey
1. **Penilaian per Tim**: Stakeholder menilai keempat tim (Maintenance, Housekeeping, Security, Cleaning Service) secara terpisah menggunakan skala Likert **1 sampai 5**:
   * **1 (Sangat Kurang)**, **2 (Kurang)**, **3 (Cukup)**, **4 (Baik)**, **5 (Sangat Baik)**.
2. **Komentar Wajib**: Stakeholder wajib mengisi kolom umpan balik (feedback) tertulis untuk tim yang mendapatkan nilai di bawah 4 sebagai bahan evaluasi perbaikan.

#### 📁 Skema Sheet Baru: \`Database_Surveys\`
Pada backend Google Sheets, data survey disimpan dalam lembar kerja baru:
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`SurveyID\` | String | ID Unik (contoh: SRV-2026-07-01) |
| \`Month\` | String | Bulan pelaksanaan (contoh: "Juli 2026") |
| \`StakeholderName\`| String | Nama stakeholder pengisi survey |
| \`Department\` | String | Divisi stakeholder (contoh: "HR & Talent", "Finance") |
| \`Mnt_Rating\` | Number | Rating 1-5 untuk tim Maintenance |
| \`Mnt_Feedback\` | String | Feedback tertulis untuk tim Maintenance |
| \`Hkp_Rating\` | Number | Rating 1-5 untuk tim Housekeeping |
| \`Hkp_Feedback\` | String | Feedback tertulis untuk tim Housekeeping |
| \`Sec_Rating\` | Number | Rating 1-5 untuk tim Security |
| \`Sec_Feedback\` | String | Feedback tertulis untuk tim Security |
| \`Cls_Rating\` | Number | Rating 1-5 untuk tim Cleaning Service |
| \`Cls_Feedback\` | String | Feedback tertulis untuk tim Cleaning Service |
| \`SubmittedAt\` | DateTime | ISO timestamp tanggal pengisian |

#### 🔄 Integrasi ke Perhitungan KPI Bulanan
Nilai Akhir KPI Terintegrasi untuk masing-masing tim dihitung dengan formula pembobotan:
$$\\text{Skor Akhir KPI Tim} = (\\text{Kepatuhan SLA} \\times 60\\%) + (\\text{Rata-rata Survey Stakeholder} \\times 40\\%)$$
`
  },
  {
    id: "asset-inventory-prd",
    title: "7. Modul Pengelolaan Aset & Stock Opname",
    icon: "Boxes",
    content: `
### 📦 Modul Pengelolaan Aset & Stock Opname Terintegrasi (Asset Inventory)
Sesuai arahan ekspansi operasional, divisi General Affair meluncurkan tim ke-5: **Asset Inventory**. Tim ini bertanggung jawab penuh atas pencatatan, pemeliharaan, serta verifikasi fisik berkala (*Stock Opname*) seluruh aset tetap maupun bergerak milik perusahaan.

---

### 📋 Alur Bisnis Pengelolaan Aset Terintegrasi
1. **Penyusunan Jadwal Stock Opname (Scheduling)**:
   Supervisor Asset Inventory merencanakan jadwal pemeriksaan per lokasi atau per kategori aset pada awal bulan di Google Sheet \`Jadwal_Opname\`.
2. **Pelaksanaan Stock Opname (Execution)**:
   Petugas lapangan melakukan scan/verifikasi fisik langsung, mencocokkan jumlah aktual (*Physical Count*) dengan jumlah tercatat di sistem (*System Count*), dan mengidentifikasi kondisi aset (Baik, Rusak, atau Hilang).
3. **Pencapaian Kepatuhan (Compliance KPI)**:
   Persentase jadwal yang sukses diselesaikan tepat waktu terhadap total jadwal aktif bulan berjalan menjadi dasar nilai penilaian kinerja tim Asset Inventory.
4. **Penyesuaian Selisih & Rekonsiliasi (Adjustment & Reconciliation)**:
   Bila terjadi selisih (*Discrepancy*), sistem mewajibkan pengisian alasan selisih. Manager GA berhak melakukan persetujuan penyesuaian (*Adjustment Approval*) yang secara otomatis memutakhirkan saldo sistem agar cocok dengan kondisi riil di lapangan.

---

### 💾 Skema Google Sheets untuk Asset & Stock Opname

#### A. Sheet \`Database_Aset\`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`AssetID\` | String | ID Unik Aset (contoh: AST-LT3-001) |
| \`Name\` | String | Nama Aset (contoh: Laptop Lenovo ThinkPad L14) |
| \`Category\` | String | Kategori (IT Equipment, Office Furniture, Electronic, dll) |
| \`SystemQty\`| Number | Jumlah terdaftar secara teoritis di sistem |
| \`PhysicalQty\`| Number| Jumlah aktual fisik setelah stock opname terakhir |
| \`Location\` | String | Lokasi penempatan spesifik |
| \`LastOpname\`| DateTime | ISO Tanggal pemeriksaan fisik terakhir |
| \`Status\` | String | Kondisi mayoritas (In-Use, Damaged, Stored, Lost) |

#### B. Sheet \`Jadwal_Opname\`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`ScheduleID\`| String | ID Jadwal (contoh: SCH-2026-07-01) |
| \`Title\` | String | Judul Agenda Stock Opname |
| \`Month\` | String | Periode Bulan (contoh: "Juli 2026") |
| \`ScheduledDate\`| DateTime| Target tanggal pelaksanaan |
| \`Status\` | String | Enum: Scheduled, In-Progress, Completed, Overdue |
| \`TotalItems\`| Number | Estimasi jumlah item unik yang diperiksa |
| \`CountedItems\`| Number| Jumlah item yang telah berhasil diverifikasi fisiknya |
| \`CompletedDate\`| DateTime| ISO Tanggal ketika seluruh item selesai di-opname |

#### C. Sheet \`Log_Opname_Detail\`
Mencatat detail hasil verifikasi per item aset per jadwal:
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| \`LogID\` | String | ID Unik Log (contoh: OPL-10029) |
| \`ScheduleID\`| String | Referensi ke ID Jadwal |
| \`AssetID\` | String | Referensi ke ID Aset |
| \`SystemQty\`| Number | Saldo sistem saat pemeriksaan |
| \`PhysicalQty\`| Number| Jumlah hitungan fisik di lapangan |
| \`Discrepancy\`| Number | Selisih (PhysicalQty - SystemQty) |
| \`Reason\` | String | Catatan alasan jika terjadi selisih |
| \`IsAdjusted\`| Boolean | Apakah selisih saldo sistem sudah direkonsiliasi |
| \`AdjustmentNote\`| String| Keterangan otorisasi penyesuaian |
| \`AdjustedAt\`| DateTime | ISO tanggal persetujuan pemutakhiran saldo |
`
  }
];

export const initialSurveys = [
  {
    id: "SRV-2026-06-01",
    month: "Juni 2026",
    stakeholderName: "Ibu Hartati Ningrum",
    department: "HR & Talent Development Director",
    ratings: {
      "Maintenance": 4,
      "Housekeeping": 5,
      "Security": 4,
      "Cleaning Service": 5,
      "Asset Inventory": 4
    },
    feedback: {
      "Maintenance": "Pipa AC sudah diperbaiki tepat waktu, namun sisa debu pembersihan sempat tertinggal sedikit.",
      "Housekeeping": "Setup ruang pelatihan sangat rapi dan lengkap dengan air galon serta tissue.",
      "Security": "Patroli malam berjalan baik. Sangat responsif saat dilaporkan ada mobil menghalangi jalan.",
      "Cleaning Service": "Luar biasa bersih terutama toilet lt. 3, selalu harum melati sepanjang siang.",
      "Asset Inventory": "Pendataan aset laptop baru untuk staf HR berjalan tertib dan nomor seri tercatat rapi."
    },
    submittedAt: "2026-06-28T10:15:00.000Z"
  },
  {
    id: "SRV-2026-06-02",
    month: "Juni 2026",
    stakeholderName: "Bapak Surya Permana",
    department: "Finance & Accounting Head",
    ratings: {
      "Maintenance": 5,
      "Housekeeping": 4,
      "Security": 5,
      "Cleaning Service": 4,
      "Asset Inventory": 5
    },
    feedback: {
      "Maintenance": "Penanganan cipratan api pada saklar pantry sangat mengagumkan, diselesaikan dalam 20 menit!",
      "Housekeeping": "Pengantaran galon lancar, hanya saja kadang datang mendekati sore hari.",
      "Security": "Tim keamanan sangat tertib menjaga gerbang masuk dan membantu tamu penting perusahaan.",
      "Cleaning Service": "Lantai selasar selalu disapu berkala, pertahankan kinerjanya.",
      "Asset Inventory": "Stock opname kursi kerja di ruang keuangan dilakukan tanpa mengganggu jam kerja reguler kami."
    },
    submittedAt: "2026-06-29T14:32:00.000Z"
  }
];

export const initialAssets: AssetItem[] = [
  {
    id: "AST-IT-101",
    name: "Lenovo ThinkPad L14 Gen 3",
    category: "IT Equipment",
    systemQty: 25,
    physicalQty: 25,
    location: "Lt. 2 Divisi HRD",
    lastOpnameDate: "2026-06-25T11:00:00.000Z",
    status: "In-Use"
  },
  {
    id: "AST-FN-202",
    name: "Kursi Kerja Ergonomis Hank",
    category: "Office Furniture",
    systemQty: 40,
    physicalQty: 38,
    location: "Lt. 2 Divisi Keuangan",
    lastOpnameDate: "2026-06-28T15:30:00.000Z",
    status: "In-Use"
  },
  {
    id: "AST-EL-303",
    name: "AC Split Daikin 1.5 PK",
    category: "Electronic",
    systemQty: 12,
    physicalQty: 12,
    location: "Lt. 1 Lobby Utama",
    lastOpnameDate: "2026-05-15T09:00:00.000Z",
    status: "In-Use"
  },
  {
    id: "AST-EL-304",
    name: "Smart TV Samsung 55\" 4K",
    category: "Electronic",
    systemQty: 5,
    physicalQty: 4,
    location: "Lt. 3 Meeting Room",
    lastOpnameDate: "2026-07-05T14:00:00.000Z",
    status: "In-Use"
  },
  {
    id: "AST-EL-305",
    name: "Epson Projector EB-X06",
    category: "Electronic",
    systemQty: 8,
    physicalQty: 8,
    location: "Lt. 1 Training Center",
    lastOpnameDate: "2026-05-20T10:30:00.000Z",
    status: "Stored"
  },
  {
    id: "AST-FN-206",
    name: "Meja Rapat Kayu Jati 10 Seat",
    category: "Office Furniture",
    systemQty: 3,
    physicalQty: 3,
    location: "Lt. 3 Ruang Direksi",
    lastOpnameDate: "2026-05-20T11:00:00.000Z",
    status: "In-Use"
  },
  {
    id: "AST-SC-401",
    name: "Peralatan CCTV Hikvision Dome",
    category: "Security Tools",
    systemQty: 16,
    physicalQty: 16,
    location: "Gedung A (All Area)",
    lastOpnameDate: "2026-07-08T16:00:00.000Z",
    status: "In-Use"
  }
];

export const initialOpnameSchedules: OpnameSchedule[] = [
  {
    id: "SCH-2026-06-01",
    title: "Opname Bulanan Laptop Divisi HRD",
    month: "Juni 2026",
    scheduledDate: "2026-06-25",
    status: "Completed",
    totalItems: 25,
    countedItems: 25,
    completedDate: "2026-06-25T11:30:00.000Z"
  },
  {
    id: "SCH-2026-06-02",
    title: "Opname Kursi Kerja Staff Lt. 2",
    month: "Juni 2026",
    scheduledDate: "2026-06-28",
    status: "Completed",
    totalItems: 40,
    countedItems: 40,
    completedDate: "2026-06-28T16:00:00.000Z"
  },
  {
    id: "SCH-2026-07-01",
    title: "Opname Elektronik & Display Lt. 3",
    month: "Juli 2026",
    scheduledDate: "2026-07-05",
    status: "In-Progress",
    totalItems: 5,
    countedItems: 4,
  },
  {
    id: "SCH-2026-07-02",
    title: "Opname AC & Kipas Seluruh Gedung",
    month: "Juli 2026",
    scheduledDate: "2026-07-28",
    status: "Scheduled",
    totalItems: 12,
    countedItems: 0,
  },
  {
    id: "SCH-2026-05-01",
    title: "Opname Furnitur & Meja Lt. 1",
    month: "Mei 2026",
    scheduledDate: "2026-05-20",
    status: "Overdue",
    totalItems: 11,
    countedItems: 8,
  }
];

export const initialOpnameLogs: OpnameLog[] = [
  {
    id: "OPL-001",
    scheduleId: "SCH-2026-06-01",
    assetId: "AST-IT-101",
    assetName: "Lenovo ThinkPad L14 Gen 3",
    systemQty: 25,
    physicalQty: 25,
    discrepancy: 0,
    adjusted: false
  },
  {
    id: "OPL-002",
    scheduleId: "SCH-2026-06-02",
    assetId: "AST-FN-202",
    assetName: "Kursi Kerja Ergonomis Hank",
    systemQty: 40,
    physicalQty: 38,
    discrepancy: -2,
    discrepancyReason: "2 Unit rusak berat di gudang dan sudah diajukan scrap pembuangan namun belum di-update di kartu stok.",
    adjusted: true,
    adjustmentNote: "Otorisasi Supervisor GA: Disetujui pemotongan stok sistem dari 40 menjadi 38 unit.",
    adjustedAt: "2026-06-29T02:00:00.000Z"
  },
  {
    id: "OPL-003",
    scheduleId: "SCH-2026-07-01",
    assetId: "AST-EL-304",
    assetName: "Smart TV Samsung 55\" 4K",
    systemQty: 5,
    physicalQty: 4,
    discrepancy: -1,
    discrepancyReason: "1 Unit dipindahkan sementara ke ruang rapat utama Lt. 1 namun nomor seri tidak tercatat di register Lt. 3.",
    adjusted: false
  }
];

export const initialKosHouses: KosHouse[] = [
  {
    id: "KOS-01",
    name: "Wisma Kos GA Kemanggisan",
    address: "Jl. Kemanggisan Raya No. 42, Palmerah, Jakarta Barat",
    phone: "0811-1234-567"
  },
  {
    id: "KOS-02",
    name: "Wisma Kos GA Kebayoran",
    address: "Jl. Kramat Pela No. 88, Kebayoran Baru, Jakarta Selatan",
    phone: "0811-9876-543"
  }
];

export const initialKosRooms: KosRoom[] = [
  // Wisma Kos GA Kemanggisan
  {
    id: "RM-101",
    houseId: "KOS-01",
    roomNumber: "Kamar 101",
    type: "Standar",
    price: 1500000,
    status: "Occupied",
    occupantName: "Adit Prasetyo",
    occupantPhone: "0812-3456-7890",
    checkInDate: "2026-01-10",
  },
  {
    id: "RM-102",
    houseId: "KOS-01",
    roomNumber: "Kamar 102",
    type: "Standar",
    price: 1500000,
    status: "Available"
  },
  {
    id: "RM-201",
    houseId: "KOS-01",
    roomNumber: "Kamar 201",
    type: "Superior",
    price: 2200000,
    status: "Occupied",
    occupantName: "Siti Rahma",
    occupantPhone: "0823-4567-8901",
    checkInDate: "2026-03-15",
  },
  {
    id: "RM-202",
    houseId: "KOS-01",
    roomNumber: "Kamar 202",
    type: "Superior",
    price: 2200000,
    status: "Maintenance"
  },
  {
    id: "RM-301",
    houseId: "KOS-01",
    roomNumber: "Kamar 301",
    type: "AC",
    price: 3000000,
    status: "Occupied",
    occupantName: "Kevin Sanjaya",
    occupantPhone: "0834-5678-9012",
    checkInDate: "2026-05-01",
  },
  {
    id: "RM-302",
    houseId: "KOS-01",
    roomNumber: "Kamar 302",
    type: "AC",
    price: 3000000,
    status: "Available"
  },

  // Wisma Kos GA Kebayoran
  {
    id: "RM-A1",
    houseId: "KOS-02",
    roomNumber: "Kamar A1",
    type: "Standar",
    price: 1600000,
    status: "Occupied",
    occupantName: "Dewi Lestari",
    occupantPhone: "0845-6789-0123",
    checkInDate: "2026-02-20",
  },
  {
    id: "RM-A2",
    houseId: "KOS-02",
    roomNumber: "Kamar A2",
    type: "Standar",
    price: 1600000,
    status: "Available"
  },
  {
    id: "RM-B1",
    houseId: "KOS-02",
    roomNumber: "Kamar B1",
    type: "Superior",
    price: 2400000,
    status: "Occupied",
    occupantName: "Rian Hidayat",
    occupantPhone: "0856-7890-1234",
    checkInDate: "2026-04-10",
  },
  {
    id: "RM-B2",
    houseId: "KOS-02",
    roomNumber: "Kamar B2",
    type: "Superior",
    price: 2400000,
    status: "Available"
  },
  {
    id: "RM-C1",
    houseId: "KOS-02",
    roomNumber: "Kamar C1",
    type: "AC",
    price: 3200000,
    status: "Occupied",
    occupantName: "Amanda Manopo",
    occupantPhone: "0867-8901-2345",
    checkInDate: "2026-06-01",
  },
  {
    id: "RM-C2",
    houseId: "KOS-02",
    roomNumber: "Kamar C2",
    type: "AC",
    price: 3200000,
    status: "Available"
  }
];

export const initialKosPayments: KosPayment[] = [
  // Mei 2026
  {
    id: "PAY-001",
    roomId: "RM-101",
    roomNumber: "Kamar 101",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Adit Prasetyo",
    amount: 1500000,
    month: "Mei 2026",
    paidAt: "2026-05-02T09:15:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-002",
    roomId: "RM-201",
    roomNumber: "Kamar 201",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Siti Rahma",
    amount: 2200000,
    month: "Mei 2026",
    paidAt: "2026-05-05T10:00:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-003",
    roomId: "RM-301",
    roomNumber: "Kamar 301",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Kevin Sanjaya",
    amount: 3000000,
    month: "Mei 2026",
    paidAt: "2026-05-04T13:40:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-004",
    roomId: "RM-A1",
    roomNumber: "Kamar A1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Dewi Lestari",
    amount: 1600000,
    month: "Mei 2026",
    paidAt: "2026-05-03T11:00:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-005",
    roomId: "RM-B1",
    roomNumber: "Kamar B1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Rian Hidayat",
    amount: 2400000,
    month: "Mei 2026",
    paidAt: "2026-05-06T14:20:00.000Z",
    status: "Paid"
  },

  // Juni 2026
  {
    id: "PAY-006",
    roomId: "RM-101",
    roomNumber: "Kamar 101",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Adit Prasetyo",
    amount: 1500000,
    month: "Juni 2026",
    paidAt: "2026-06-02T08:30:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-007",
    roomId: "RM-201",
    roomNumber: "Kamar 201",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Siti Rahma",
    amount: 2200000,
    month: "Juni 2026",
    paidAt: "2026-06-03T10:15:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-008",
    roomId: "RM-301",
    roomNumber: "Kamar 301",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Kevin Sanjaya",
    amount: 3000000,
    month: "Juni 2026",
    paidAt: "2026-06-02T16:05:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-009",
    roomId: "RM-A1",
    roomNumber: "Kamar A1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Dewi Lestari",
    amount: 1600000,
    month: "Juni 2026",
    paidAt: "2026-06-05T09:00:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-010",
    roomId: "RM-B1",
    roomNumber: "Kamar B1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Rian Hidayat",
    amount: 2400000,
    month: "Juni 2026",
    paidAt: "2026-06-04T11:55:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-011",
    roomId: "RM-C1",
    roomNumber: "Kamar C1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Amanda Manopo",
    amount: 3200000,
    month: "Juni 2026",
    paidAt: "2026-06-01T15:30:00.000Z",
    status: "Paid"
  },

  // Juli 2026
  {
    id: "PAY-012",
    roomId: "RM-101",
    roomNumber: "Kamar 101",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Adit Prasetyo",
    amount: 1500000,
    month: "Juli 2026",
    paidAt: "2026-07-02T09:00:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-013",
    roomId: "RM-201",
    roomNumber: "Kamar 201",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Siti Rahma",
    amount: 2200000,
    month: "Juli 2026",
    paidAt: "2026-07-04T10:45:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-014",
    roomId: "RM-301",
    roomNumber: "Kamar 301",
    houseName: "Wisma Kos GA Kemanggisan",
    tenantName: "Kevin Sanjaya",
    amount: 3000000,
    month: "Juli 2026",
    paidAt: "2026-07-02T14:10:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-015",
    roomId: "RM-A1",
    roomNumber: "Kamar A1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Dewi Lestari",
    amount: 1600000,
    month: "Juli 2026",
    paidAt: "2026-07-03T08:30:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-016",
    roomId: "RM-B1",
    roomNumber: "Kamar B1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Rian Hidayat",
    amount: 2400000,
    month: "Juli 2026",
    paidAt: "2026-07-05T15:20:00.000Z",
    status: "Paid"
  },
  {
    id: "PAY-017",
    roomId: "RM-C1",
    roomNumber: "Kamar C1",
    houseName: "Wisma Kos GA Kebayoran",
    tenantName: "Amanda Manopo",
    amount: 3200000,
    month: "Juli 2026",
    paidAt: "2026-07-01T09:15:00.000Z",
    status: "Paid"
  }
];

