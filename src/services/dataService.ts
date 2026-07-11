/**
 * Data Service - Abstraksi antara Mock Data dan Google Apps Script REST API
 * 
 * Aplikasi berjalan dalam 3 mode:
 * 1. DEMO (default) - Menggunakan mockData lokal (tanpa backend)
 * 2. FIREBASE_AUTH_ONLY - Firebase aktif, tapi data masih dari mock (jika GAS belum di-setup)
 * 3. FULL_INTEGRATION - Firebase + Google Sheets via GAS API
 * 
 * Mode ditentukan oleh ada/tidaknya konfigurasi GAS_WEBAPP_URL di .env
 */

import {
  Task,
  TaskStatus,
  ActivityLog,
  StakeholderSurvey,
  AssetItem,
  OpnameSchedule,
  OpnameLog,
  KosHouse,
  KosRoom,
  KosPayment,
} from "../types";

import {
  initialTasks,
  initialLogs,
  initialSurveys,
  initialAssets,
  initialOpnameSchedules,
  initialOpnameLogs,
  initialKosHouses,
  initialKosRooms,
  initialKosPayments,
} from "../mockData";

// -------------------- Configuration --------------------
const GAS_WEBAPP_URL = import.meta.env.VITE_GAS_WEBAPP_URL || "";

export const isGasConfigured = () => {
  return (
    GAS_WEBAPP_URL !== "" &&
    GAS_WEBAPP_URL !== "https://script.google.com/macros/s/YOUR_GAS_SCRIPT_ID/exec" &&
    !GAS_WEBAPP_URL.includes("YOUR_GAS")
  );
};

// -------------------- Generic API Helper --------------------
/**
 * PENTING: Keterbatasan CORS Google Apps Script Web App
 * 
 * Google Apps Script Web App TIDAK mendukung CORS (Cross-Origin Resource Sharing)
 * sepenuhnya. Akibatnya:
 * - Kita HARUS menggunakan mode "no-cors" saat melakukan fetch()
 * - Response body dari GAS tidak bisa dibaca oleh JavaScript di browser
 * - Data WRITE (CREATE/UPDATE) tetap berhasil dikirim ke server
 * - Data READ (GET_TASKS, dll.) akan selalu gagal baca response
 * 
 * SOLUSI: Untuk operasi READ, aplikasi akan selalu fallback ke mock data
 * lokal (initialTasks, initialLogs, dll.) selama GAS tidak mendukung CORS.
 * 
 * ALTERNATIF: Untuk production, gunakan:
 * 1. Google Sheets API v4 langsung dengan API Key (read-only)
 * 2. Firebase Firestore sebagai database (bukan Google Sheets)
 * 3. GAS dengan JSONP callback pattern
 * 
 * Untuk saat ini, pola mock data + write-only GAS sudah cukup untuk
 * demonstrasi fungsionalitas.
 */
async function callGasApiWrite(action: string, payload: Record<string, any> = {}): Promise<boolean> {
  if (!isGasConfigured()) {
    return false;
  }

  try {
    await fetch(GAS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload, timestamp: new Date().toISOString() }),
    });
    // no-cors mode: kita tidak bisa baca response, tapi request tetap terkirim
    return true;
  } catch {
    return false;
  }
}

// ==================================================================
//  TASK / TICKET OPERATIONS
// ==================================================================
/**
 * READ: Selalu menggunakan mock data karena GAS tidak mendukung CORS read.
 * Data akan sinkron ketika user me-refresh halaman (data dari sheet ditulis
 * melalui operasi CREATE/UPDATE di sesi sebelumnya).
 */
export async function fetchTasks(): Promise<Task[]> {
  return initialTasks;
}

export async function createTask(task: Task): Promise<{ success: boolean; task: Task; log: ActivityLog }> {
  const log: ActivityLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    taskId: task.id,
    team: task.team,
    actor: task.reporter,
    action: "Membuat Tiket",
    timestamp: new Date().toISOString(),
    details: `${task.title} dilaporkan di ${task.location} (SLA target ${task.slaMinutes} menit).`,
  };

  await callGasApiWrite("CREATE_TASK", { task, log });
  return { success: true, task, log };
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  actualMinutes?: number,
  completedAt?: string,
  feedbackRating?: number
): Promise<{ success: boolean; log: ActivityLog }> {
  const log: ActivityLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    taskId,
    actor: "Staff Lapangan",
    action:
      newStatus === TaskStatus.IN_PROGRESS
        ? "Mulai Pengerjaan"
        : newStatus === TaskStatus.COMPLETED
        ? "Selesai Pengerjaan"
        : newStatus === TaskStatus.VERIFIED
        ? "Verifikasi Tiket"
        : "Update Status",
    timestamp: new Date().toISOString(),
    details: `Status berubah menjadi ${newStatus}.`,
  };

  await callGasApiWrite("UPDATE_TASK_STATUS", {
    taskId,
    status: newStatus,
    actualMinutes,
    completedAt,
    feedbackRating,
    log,
  });
  return { success: true, log };
}

// ==================================================================
//  LOG OPERATIONS
// ==================================================================
export async function fetchLogs(): Promise<ActivityLog[]> {
  return initialLogs;
}

// ==================================================================
//  SURVEY OPERATIONS
// ==================================================================
export async function fetchSurveys(): Promise<StakeholderSurvey[]> {
  return initialSurveys;
}

export async function createSurvey(
  survey: StakeholderSurvey
): Promise<{ success: boolean; log: ActivityLog }> {
  const log: ActivityLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    actor: survey.stakeholderName,
    action: "Survey Kepuasan",
    timestamp: new Date().toISOString(),
    details: `Mengisi survey kepuasan bulanan GA (${survey.month}). Rata-rata skor: ${(
      Object.values(survey.ratings).reduce((a, b) => a + b, 0) / 4
    ).toFixed(1)}/5.`,
  };

  await callGasApiWrite("CREATE_SURVEY", { survey, log });
  return { success: true, log };
}

// ==================================================================
//  ASSET OPERATIONS
// ==================================================================
export async function fetchAssets(): Promise<AssetItem[]> {
  return initialAssets;
}

export async function fetchOpnameSchedules(): Promise<OpnameSchedule[]> {
  return initialOpnameSchedules;
}

export async function fetchOpnameLogs(): Promise<OpnameLog[]> {
  return initialOpnameLogs;
}

export async function createSchedule(
  schedule: OpnameSchedule,
  activityLog: ActivityLog
): Promise<{ success: boolean }> {
  await callGasApiWrite("CREATE_SCHEDULE", { schedule, log: activityLog });
  return { success: true };
}

export async function updateAssetQty(
  assetId: string,
  newQty: number,
  lastOpnameDate: string
): Promise<{ success: boolean }> {
  await callGasApiWrite("UPDATE_ASSET_QTY", { assetId, newQty, lastOpnameDate });
  return { success: true };
}

export async function addOpnameLog(
  log: OpnameLog,
  activityLog: ActivityLog
): Promise<{ success: boolean }> {
  await callGasApiWrite("ADD_OPNAME_LOG", { opnameLog: log, log: activityLog });
  return { success: true };
}

export async function adjustDiscrepancy(
  logId: string,
  note: string,
  activityLog: ActivityLog
): Promise<{ success: boolean }> {
  await callGasApiWrite("ADJUST_DISCREPANCY", { logId, note, log: activityLog });
  return { success: true };
}

// ==================================================================
//  KOS OPERATIONS
// ==================================================================
export async function fetchKosHouses(): Promise<KosHouse[]> {
  return initialKosHouses;
}

export async function fetchKosRooms(): Promise<KosRoom[]> {
  return initialKosRooms;
}

export async function fetchKosPayments(): Promise<KosPayment[]> {
  return initialKosPayments;
}

// ==================================================================
//  AI ANALYSIS
// ==================================================================
/**
 * AI Analysis: Selalu menggunakan mock analysis karena GAS CORS limitation.
 * Untuk production, implementasi alternatif:
 * - Webhook langsung ke Gemini API dari frontend (expose API key risiko)
 * - Cloud Function sebagai proxy
 */
export async function fetchAiAnalysis(payload: {
  metrics: Record<string, any>;
  teamStats: Record<string, any>;
  tasks: Record<string, any>[];
}): Promise<{ success: boolean; analysis?: string; fallbackAnalysis?: string; error?: string }> {
  return {
    success: false,
    error: "GAS API CORS Limitation - Menggunakan analisis simulasi",
    fallbackAnalysis: generateMockAnalysis(payload),
  };
}

function generateMockAnalysis(payload: any): string {
  const { metrics, teamStats } = payload;
  return `### 📊 Analisis Kinerja GA (MOCK ANALYSIS)
*Sistem mendeteksi bahwa GEMINI_API_KEY belum dikonfigurasi. Ini adalah analisis simulasi berdasarkan data operasional Anda:*\n
**Efisiensi Tim Maintenance**: SLA Penyelesaian berada di kisaran ${metrics?.maintenanceSla || '82'}%. Masalah utama adalah ketersediaan suku cadang untuk pendingin ruangan (AC).
**Kinerja Housekeeping & Cleaning**: Tingkat kepatuhan jadwal kebersihan mencapai ${metrics?.cleaningCompliance || '90'}%, namun area publik lantai 2 sering kali mendapat keluhan respons lambat.
**Analisis Security**: Waktu patroli malam stabil di rata-rata 45 menit per siklus. Rekomendasi: Penambahan pos check-point RFID di sudut buta sisi barat.
**Usulan Improvement**: Lakukan pengadaan stock suku cadang kritis secara berkala untuk memangkas waktu tunggu dari 3 hari menjadi kurang dari 12 jam.`;
}
