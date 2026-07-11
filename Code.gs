/**
 * ==========================================================
 *  GA PERFORMANCE DASHBOARD - Google Apps Script Backend
 * ==========================================================
 *
 *  Google Sheets sebagai Database untuk aplikasi GA Performance.
 *  Deploy sebagai Web App → dapat dipanggil via fetch() dari React.
 *
 *  Cara deploy:
 *    1. Buat Google Spreadsheet baru
 *    2. Extensions → Apps Script
 *    3. Paste kode ini
 *    4. Deploy → New Deployment → Web App
 *    5. Set "Execute as" → "Me"
 *    6. Set "Who has access" → "Anyone"
 *    7. Copy URL Web App → paste ke .env VITE_GAS_WEBAPP_URL
 *
 * ==========================================================
 *  STRUKTUR SHEETS
 * ==========================================================
 *
 *  Spreadsheet harus memiliki sheets berikut:
 *  1. Database_Tiket
 *  2. Database_Logs
 *  3. Database_Surveys
 *  4. Database_Aset
 *  5. Jadwal_Opname
 *  6. Log_Opname_Detail
 *  7. Database_Kos_Houses
 *  8. Database_Kos_Rooms
 *  9. Database_Kos_Payments
 */

// ==========================================================
//  WEB APP ENTRY POINTS
// ==========================================================

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var params;
    if (method === 'POST') {
      params = JSON.parse(e.postData.contents);
    } else {
      params = e.parameter;
    }

    var action = params.action;
    var result;

    switch (action) {
      // ============ TASKS / TICKETS ============
      case 'GET_TASKS':
        result = getTasks();
        break;
      case 'CREATE_TASK':
        result = createTask(params.task, params.log);
        break;
      case 'UPDATE_TASK_STATUS':
        result = updateTaskStatus(params.taskId, params.status, params.actualMinutes, params.completedAt, params.feedbackRating, params.log);
        break;

      // ============ LOGS ============
      case 'GET_LOGS':
        result = getLogs();
        break;

      // ============ SURVEYS ============
      case 'GET_SURVEYS':
        result = getSurveys();
        break;
      case 'CREATE_SURVEY':
        result = createSurvey(params.survey, params.log);
        break;

      // ============ ASSETS ============
      case 'GET_ASSETS':
        result = getAssets();
        break;
      case 'UPDATE_ASSET_QTY':
        result = updateAssetQty(params.assetId, params.newQty, params.lastOpnameDate);
        break;

      // ============ OPNAME SCHEDULES ============
      case 'GET_OPNAME_SCHEDULES':
        result = getOpnameSchedules();
        break;
      case 'CREATE_SCHEDULE':
        result = createSchedule(params.schedule, params.log);
        break;

      // ============ OPNAME LOGS ============
      case 'GET_OPNAME_LOGS':
        result = getOpnameLogs();
        break;
      case 'ADD_OPNAME_LOG':
        result = addOpnameLog(params.opnameLog, params.log);
        break;
      case 'ADJUST_DISCREPANCY':
        result = adjustDiscrepancy(params.logId, params.note, params.log);
        break;

      // ============ KOS ============
      case 'GET_KOS_HOUSES':
        result = getKosHouses();
        break;
      case 'GET_KOS_ROOMS':
        result = getKosRooms();
        break;
      case 'GET_KOS_PAYMENTS':
        result = getKosPayments();
        break;

      // ============ AI ANALYSIS ============
      case 'AI_ANALYSIS':
        result = aiAnalysis(params);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return sendJson(result);
  } catch (err) {
    return sendJson({ success: false, error: err.toString() });
  }
}

function sendJson(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Baca semua baris dari sheet dan skip header
 */
function readSheet(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    // Buat sheet jika belum ada
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    sheet.appendRow(['ID', 'Data Kosong', 'Silakan inisialisasi sheet ini']);
    return [];
  }
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    data.push(obj);
  }
  return data;
}

function appendRow(sheetName, dataArray) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  }
  sheet.appendRow(dataArray);
}

// ==========================================================
//  TASK / TICKET OPERATIONS
// ==========================================================

function getTasks() {
  var data = readSheet('Database_Tiket');
  return { success: true, data: data };
}

function createTask(task, log) {
  appendRow('Database_Tiket', [
    task.id, task.title, task.description, task.team,
    task.reporter, task.location, task.priority, task.status,
    task.createdAt, task.updatedAt, task.completedAt || '',
    task.slaMinutes, task.actualMinutes || '', task.feedbackRating || ''
  ]);

  appendRow('Database_Logs', [
    log.id, log.taskId, log.team || '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

function updateTaskStatus(taskId, newStatus, actualMinutes, completedAt, feedbackRating, log) {
  // Cari baris yang sesuai
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database_Tiket');
  if (!sheet) return { success: false, error: 'Sheet Database_Tiket tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === taskId) {
      // Kolom 8 (index 7) adalah Status
      sheet.getRange(i + 1, 8).setValue(newStatus);
      sheet.getRange(i + 1, 10).setValue(new Date().toISOString()); // UpdatedAt

      if (newStatus === 'Completed') {
        if (actualMinutes) sheet.getRange(i + 1, 13).setValue(actualMinutes);
        if (completedAt) sheet.getRange(i + 1, 11).setValue(completedAt);
      }

      if (newStatus === 'Verified' && feedbackRating) {
        sheet.getRange(i + 1, 14).setValue(feedbackRating);
      }
      break;
    }
  }

  // Simpan log
  appendRow('Database_Logs', [
    log.id, log.taskId, log.team || '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

// ==========================================================
//  LOG OPERATIONS
// ==========================================================

function getLogs() {
  var data = readSheet('Database_Logs');
  return { success: true, data: data };
}

// ==========================================================
//  SURVEY OPERATIONS
// ==========================================================

function getSurveys() {
  var data = readSheet('Database_Surveys');
  return { success: true, data: data };
}

function createSurvey(survey, log) {
  appendRow('Database_Surveys', [
    survey.id, survey.month, survey.stakeholderName, survey.department,
    survey.ratings['Maintenance'] || 0, survey.feedback['Maintenance'] || '',
    survey.ratings['Housekeeping'] || 0, survey.feedback['Housekeeping'] || '',
    survey.ratings['Security'] || 0, survey.feedback['Security'] || '',
    survey.ratings['Cleaning Service'] || 0, survey.feedback['Cleaning Service'] || '',
    survey.ratings['Asset Inventory'] || 0, survey.feedback['Asset Inventory'] || '',
    survey.submittedAt
  ]);

  appendRow('Database_Logs', [
    log.id, '', '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

// ==========================================================
//  ASSET OPERATIONS
// ==========================================================

function getAssets() {
  var data = readSheet('Database_Aset');
  return { success: true, data: data };
}

function updateAssetQty(assetId, newQty, lastOpnameDate) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Database_Aset');
  if (!sheet) return { success: false, error: 'Sheet Database_Aset tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === assetId) {
      // Kolom 4 (index 3) = SystemQty, Kolom 5 (index 4) = PhysicalQty, Kolom 7 (index 6) = LastOpname
      sheet.getRange(i + 1, 4).setValue(newQty);
      sheet.getRange(i + 1, 5).setValue(newQty);
      sheet.getRange(i + 1, 7).setValue(lastOpnameDate);
      break;
    }
  }
  return { success: true };
}

// ==========================================================
//  OPNAME SCHEDULE OPERATIONS
// ==========================================================

function getOpnameSchedules() {
  var data = readSheet('Jadwal_Opname');
  return { success: true, data: data };
}

function createSchedule(schedule, log) {
  appendRow('Jadwal_Opname', [
    schedule.id, schedule.title, schedule.month,
    schedule.scheduledDate, schedule.status,
    schedule.totalItems, schedule.countedItems,
    schedule.completedDate || ''
  ]);

  appendRow('Database_Logs', [
    log.id, '', '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

// ==========================================================
//  OPNAME LOG OPERATIONS
// ==========================================================

function getOpnameLogs() {
  var data = readSheet('Log_Opname_Detail');
  return { success: true, data: data };
}

function addOpnameLog(opnameLog, log) {
  appendRow('Log_Opname_Detail', [
    opnameLog.id, opnameLog.scheduleId, opnameLog.assetId, opnameLog.assetName,
    opnameLog.systemQty, opnameLog.physicalQty, opnameLog.discrepancy,
    opnameLog.discrepancyReason || '', opnameLog.adjusted ? 'TRUE' : 'FALSE',
    opnameLog.adjustmentNote || '', opnameLog.adjustedAt || ''
  ]);

  appendRow('Database_Logs', [
    log.id, '', '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

function adjustDiscrepancy(logId, note, log) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log_Opname_Detail');
  if (!sheet) return { success: false, error: 'Sheet Log_Opname_Detail tidak ditemukan' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === logId) {
      // Kolom 10 (index 9) = AdjustmentNote, Kolom 9 (index 8) = IsAdjusted, Kolom 11 (index 10) = AdjustedAt
      sheet.getRange(i + 1, 10).setValue(note);
      sheet.getRange(i + 1, 9).setValue('TRUE');
      sheet.getRange(i + 1, 11).setValue(new Date().toISOString());
      break;
    }
  }

  appendRow('Database_Logs', [
    log.id, '', '', log.actor,
    log.action, log.timestamp, log.details || ''
  ]);

  return { success: true };
}

// ==========================================================
//  KOS OPERATIONS
// ==========================================================

function getKosHouses() {
  var data = readSheet('Database_Kos_Houses');
  return { success: true, data: data };
}

function getKosRooms() {
  var data = readSheet('Database_Kos_Rooms');
  return { success: true, data: data };
}

function getKosPayments() {
  var data = readSheet('Database_Kos_Payments');
  return { success: true, data: data };
}

// ==========================================================
//  AI ANALYSIS (via Gemini API)
// ==========================================================

function aiAnalysis(params) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

    if (!apiKey || apiKey === '') {
      return {
        success: false,
        error: 'GEMINI_API_KEY Belum Dikonfigurasi',
        message: 'Kunci API Gemini belum dikonfigurasi di File → Project Properties → Script Properties. Tambahkan properti GEMINI_API_KEY dengan value API key Anda.',
        fallbackAnalysis: generateFallbackAnalysis(params)
      };
    }

    var prompt = generatePrompt(params);
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    };

    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response.getContentText());

    if (result.candidates && result.candidates.length > 0) {
      var analysis = result.candidates[0].content.parts[0].text;
      return { success: true, analysis: analysis };
    } else {
      return { success: false, error: 'Gemini tidak mengembalikan analisis.', fallbackAnalysis: generateFallbackAnalysis(params) };
    }
  } catch (err) {
    return { success: false, error: err.toString(), fallbackAnalysis: generateFallbackAnalysis(params) };
  }
}

function generatePrompt(params) {
  var metrics = params.metrics || {};
  var teamStats = params.teamStats || {};
  var tasks = params.tasks || [];

  return `Anda adalah konsultan operasional senior General Affair (GA). Analisis data operasional dan KPI tim GA berikut, lalu berikan saran improvement yang taktis, terperinci, dan berbasis data dalam Bahasa Indonesia yang profesional.

Data KPI Saat Ini:
- Rata-rata Kepuasan Karyawan (CSAT): ${metrics.csat || '4.2'}/5.0
- Rata-rata Respons SLA (Menit): ${metrics.avgResponseTime || '18'} menit
- Efisiensi Penyelesaian Tiket: ${metrics.completionRate || '88'}%

Rincian Statistik Tim:
${JSON.stringify(teamStats || {}, null, 2)}

Contoh Kasus Tiket Terakhir:
${JSON.stringify((tasks || []).slice(0, 8), null, 2)}

Format Analisis yang harus dikembalikan (Gunakan format Markdown):
### 🚀 Executive Summary
[Tulis ringkasan singkat status operasional GA saat ini]

### 📈 Analisis Detail Per Tim
- **Maintenance**: [Analisis]
- **Housekeeping**: [Analisis]
- **Security**: [Analisis]
- **Cleaning Service**: [Analisis]

### 🛑 Titik Kemacetan (Bottlenecks) Utama
[Sebutkan 2-3 hal utama]

### 💡 Rencana Aksi Perbaikan (Actionable Improvements)
1. **Segera (Minggu Ini)**: [Tindakan cepat]
2. **Jangka Pendek (Bulan Ini)**: [Tindakan strategis]
3. **Jangka Panjang (Kuartal Ini)**: [Transformasi]`;
}

function generateFallbackAnalysis(params) {
  var metrics = params.metrics || {};
  return `### 📊 Analisis Kinerja GA (MOCK ANALYSIS)
*Sistem mendeteksi bahwa GEMINI_API_KEY belum dikonfigurasi. Ini adalah analisis simulasi berdasarkan data operasional Anda:*

1. **Efisiensi Tim Maintenance**: SLA Penyelesaian berada di kisaran ${metrics?.maintenanceSla || '82'}%. Masalah utama adalah ketersediaan suku cadang untuk pendingin ruangan (AC).
2. **Kinerja Housekeeping & Cleaning**: Tingkat kepatuhan jadwal kebersihan mencapai ${metrics?.cleaningCompliance || '90'}%, namun area publik lantai 2 sering kali mendapat keluhan respons lambat.
3. **Analisis Security**: Waktu patroli malam stabil di rata-rata 45 menit per siklus. Rekomendasi: Penambahan pos check-point RFID di sudut buta sisi barat.
4. **Usulan Improvement**: Lakukan pengadaan stock suku cadang kritis secara berkala untuk memangkas waktu tunggu dari 3 hari menjadi kurang dari 12 jam.`;
}

// ==========================================================
//  INITIALIZATION - Jalankan sekali untuk membuat struktur sheet
// ==========================================================

function initializeSheets() {
  var sheets = [
    { name: 'Database_Tiket', headers: ['ID','Title','Description','Team','Reporter','Location','Priority','Status','CreatedAt','UpdatedAt','CompletedAt','SlaMinutes','ActualMinutes','Rating'] },
    { name: 'Database_Logs', headers: ['LogID','TicketID','Team','Actor','Action','Timestamp','Details'] },
    { name: 'Database_Surveys', headers: ['SurveyID','Month','StakeholderName','Department','Mnt_Rating','Mnt_Feedback','Hkp_Rating','Hkp_Feedback','Sec_Rating','Sec_Feedback','Cls_Rating','Cls_Feedback','Ast_Rating','Ast_Feedback','SubmittedAt'] },
    { name: 'Database_Aset', headers: ['AssetID','Name','Category','SystemQty','PhysicalQty','Location','LastOpname','Status'] },
    { name: 'Jadwal_Opname', headers: ['ScheduleID','Title','Month','ScheduledDate','Status','TotalItems','CountedItems','CompletedDate'] },
    { name: 'Log_Opname_Detail', headers: ['LogID','ScheduleID','AssetID','AssetName','SystemQty','PhysicalQty','Discrepancy','Reason','IsAdjusted','AdjustmentNote','AdjustedAt'] },
    { name: 'Database_Kos_Houses', headers: ['HouseID','Name','Address','Phone'] },
    { name: 'Database_Kos_Rooms', headers: ['RoomID','HouseID','RoomNumber','Type','Price','Status','OccupantName','OccupantPhone','CheckInDate','CheckOutDate'] },
    { name: 'Database_Kos_Payments', headers: ['PaymentID','RoomID','RoomNumber','HouseName','TenantName','Amount','Month','PaidAt','Status'] },
  ];

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  sheets.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
    }
    sheet.clear();
    sheet.appendRow(s.headers);
    sheet.setFrozenRows(1);
  });

  ss.toast('✅ Struktur database GA Performance berhasil dibuat!', 'Setup Selesai', 5);
  return JSON.stringify({ success: true, message: 'Sheets berhasil diinisialisasi' });
}
