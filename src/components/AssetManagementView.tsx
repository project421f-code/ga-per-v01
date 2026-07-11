import React, { useState } from "react";
import { AssetItem, OpnameSchedule, OpnameLog } from "../types";
import { 
  Calendar, 
  CheckCircle2, 
  ClipboardCheck, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  Plus, 
  Search, 
  Building, 
  Boxes, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  Info,
  ChevronRight,
  UserCheck,
  Wifi,
  WifiOff,
  QrCode,
  Volume2,
  Sliders,
  Database
} from "lucide-react";

interface AssetManagementViewProps {
  assets: AssetItem[];
  schedules: OpnameSchedule[];
  logs: OpnameLog[];
  onAddSchedule: (schedule: OpnameSchedule) => void;
  onUpdateAssetQty: (assetId: string, newQty: number) => void;
  onUpdateScheduleCount: (scheduleId: string, counted: number, isComplete?: boolean) => void;
  onAddOpnameLog: (log: OpnameLog) => void;
  onAdjustDiscrepancy: (logId: string, note: string) => void;
  onAddActivityLog: (actor: string, action: string, details: string) => void;
}

export default function AssetManagementView({
  assets,
  schedules,
  logs,
  onAddSchedule,
  onUpdateAssetQty,
  onUpdateScheduleCount,
  onAddOpnameLog,
  onAdjustDiscrepancy,
  onAddActivityLog
}: AssetManagementViewProps) {
  // Sub-tabs within Asset Module
  const [activeSubTab, setActiveSubTab] = useState<"jadwal" | "pelaksanaan" | "pencapaian" | "penyesuaian">("jadwal");

  // Scheduling Form States
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleMonth, setNewScheduleMonth] = useState("Juli 2026");
  const [newScheduleDate, setNewScheduleDate] = useState("2026-07-15");
  const [newScheduleItemsCount, setNewScheduleItemsCount] = useState(10);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Execution States
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules.find(s => s.status === "In-Progress" || s.status === "Scheduled")?.id || schedules[0]?.id || ""
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || "");
  const [countedQty, setCountedQty] = useState<number>(assets[0]?.systemQty || 0);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [execSuccess, setExecSuccess] = useState(false);

  // Search filter for assets list
  const [assetSearch, setAssetSearch] = useState("");

  // Adjustment notes
  const [adjustmentNotes, setAdjustmentNotes] = useState<Record<string, string>>({});
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  // --- 3 REKOMENDASI TERBAIK EXPERT STATES ---
  // A. Offline-First states
  const [isOffline, setIsOffline] = useState(false);
  const [localQueue, setLocalQueue] = useState<OpnameLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState("");

  // B. QR Code Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [scannedAssetAlert, setScannedAssetAlert] = useState<string | null>(null);

  // C. Threshold Settings state
  const [thresholdLimit, setThresholdLimit] = useState(2);

  // Sound generator for scanner beep (No third-party audio asset needed, robust synthesizer code)
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1000Hz scanner pitch
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12); // Short beep
    } catch (e) {
      console.warn("Audio Context beep error", e);
    }
  };

  // Simulated scan handler
  const handleSimulatedScan = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    playBeep();
    setSelectedAssetId(assetId);
    setCountedQty(asset.systemQty);
    setShowScanner(false);
    setScannedAssetAlert(asset.name);
    setTimeout(() => setScannedAssetAlert(null), 4000);

    onAddActivityLog(
      "Petugas Asset",
      "Pindai QR Code",
      `Berhasil memindai label QR Code fisik untuk aset: ${asset.name} (ID: ${asset.id}) di ${asset.location}.`
    );
  };

  // Simulated synchronization of offline local queue
  const handleSyncAll = () => {
    if (localQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStep("Inisiasi sinkronisasi dengan Google Sheets...");

    const progressSteps = [
      { prg: 25, txt: "Memvalidasi tanda tangan format antrean lokal..." },
      { prg: 60, txt: "Mengunggah data entri hitung ke log server pusat..." },
      { prg: 85, txt: "Menyesuaikan target pencapaian KPI tim..." },
      { prg: 100, txt: "Selesai! Semua data selaras secara real-time." }
    ];

    progressSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSyncProgress(step.prg);
        setSyncStep(step.txt);

        if (step.prg === 100) {
          // Process all offline logs
          localQueue.forEach(log => {
            onAddOpnameLog(log);

            const targetSchedule = schedules.find(s => s.id === log.scheduleId);
            if (targetSchedule) {
              const updatedCount = Math.min(targetSchedule.countedItems + 1, targetSchedule.totalItems);
              const isCompletedNow = updatedCount >= targetSchedule.totalItems;
              onUpdateScheduleCount(log.scheduleId, updatedCount, isCompletedNow);
            }
          });

          onAddActivityLog(
            "Sistem Sinkronisasi",
            "Sinkronisasi Cloud Berhasil",
            `Mengunggah ${localQueue.length} data pemeriksaan fisik dari buffer offline basement secara aman ke Google Sheets.`
          );

          setLocalQueue([]);
          setIsSyncing(false);
        }
      }, (idx + 1) * 1000);
    });
  };

  // Auto-reconcile low variance discrepancies below threshold limits
  const handleAutoReconcile = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const autoNote = `Rekonsiliasi otomatis disetujui sistem (Kebijakan Threshold Selisih Minor <= ${thresholdLimit} unit)`;

    onAdjustDiscrepancy(logId, autoNote);
    onUpdateAssetQty(log.assetId, log.physicalQty);

    onAddActivityLog(
      "Sistem GA",
      "Rekonsiliasi Otomatis (Threshold)",
      `Menyetujui otomatis selisih minor ${log.assetName}. Saldo sistem disesuaikan ke fisik lapangan (${log.physicalQty} unit). Catatan: ${autoNote}`
    );

    setAdjustSuccess(logId);
    setTimeout(() => setAdjustSuccess(null), 3000);
  };

  // 1. ADD SCHEDULE HANDLER
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return;

    const newSched: OpnameSchedule = {
      id: `SCH-${Date.now()}`,
      title: newScheduleTitle,
      month: newScheduleMonth,
      scheduledDate: newScheduleDate,
      status: "Scheduled",
      totalItems: Number(newScheduleItemsCount),
      countedItems: 0
    };

    onAddSchedule(newSched);
    onAddActivityLog(
      "Supervisor Asset",
      "Membuat Jadwal Opname",
      `Menjadwalkan agenda "${newScheduleTitle}" pada tanggal ${newScheduleDate} untuk ${newScheduleItemsCount} item aset.`
    );

    setNewScheduleTitle("");
    setScheduleSuccess(true);
    setTimeout(() => setScheduleSuccess(false), 3000);
  };

  // 2. SUBMIT EXECUTION HANDLER
  const handleExecuteOpname = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSchedule = schedules.find(s => s.id === selectedScheduleId);
    const targetAsset = assets.find(a => a.id === selectedAssetId);
    if (!targetSchedule || !targetAsset) return;

    const systemQty = targetAsset.systemQty;
    const diff = countedQty - systemQty;

    const newLog: OpnameLog = {
      id: `OPL-${Date.now()}`,
      scheduleId: selectedScheduleId,
      assetId: selectedAssetId,
      assetName: targetAsset.name,
      systemQty: systemQty,
      physicalQty: countedQty,
      discrepancy: diff,
      discrepancyReason: diff !== 0 ? discrepancyReason || "Selisih hitung lapangan" : undefined,
      adjusted: false
    };

    if (isOffline) {
      // Offline mode: store in localQueue
      setLocalQueue(prev => [newLog, ...prev]);
      onAddActivityLog(
        "Petugas Asset (Offline)",
        "Simpan Opname Offline",
        `Menyimpan hitungan fisik ${targetAsset.name} ke buffer lokal basement: Fisik ${countedQty}. Selisih: ${diff}`
      );
    } else {
      // Store log
      onAddOpnameLog(newLog);

      // Update counted items on schedule
      const updatedCount = Math.min(targetSchedule.countedItems + 1, targetSchedule.totalItems);
      const isCompletedNow = updatedCount >= targetSchedule.totalItems;
      onUpdateScheduleCount(selectedScheduleId, updatedCount, isCompletedNow);

      // Log the event
      onAddActivityLog(
        "Petugas Asset",
        "Eksekusi Stock Opname",
        `Verifikasi fisik ${targetAsset.name} di ${targetAsset.location}: Terdaftar ${systemQty}, Fisik ${countedQty}. Selisih: ${diff}`
      );
    }

    setExecSuccess(true);
    setDiscrepancyReason("");
    setTimeout(() => setExecSuccess(false), 3000);
  };

  // Update counted qty input default when selected asset changes
  const handleAssetSelectChange = (id: string) => {
    setSelectedAssetId(id);
    const asset = assets.find(a => a.id === id);
    if (asset) {
      setCountedQty(asset.systemQty);
    }
  };

  // 3. EXECUTE RECONCILIATION ADJUSTMENT
  const handleApproveAdjustment = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const note = adjustmentNotes[logId] || "Rekonsiliasi manual disetujui Manager GA";
    
    // 1. Adjust discrepancy state
    onAdjustDiscrepancy(logId, note);

    // 2. Adjust System Quantity to match physical count
    onUpdateAssetQty(log.assetId, log.physicalQty);

    // 3. Create activity log
    onAddActivityLog(
      "Manager General Affair",
      "Persetujuan Rekonsiliasi Aset",
      `Menyetujui penyesuaian saldo ${log.assetName}. Saldo sistem disesuaikan dari ${log.systemQty} menjadi ${log.physicalQty}. Catatan: ${note}`
    );

    setAdjustSuccess(logId);
    setTimeout(() => setAdjustSuccess(null), 3000);
  };

  // CALCULATE KPI ACHIEVEMENT
  const totalSchedules = schedules.length;
  const completedSchedules = schedules.filter(s => s.status === "Completed").length;
  const inProgressSchedules = schedules.filter(s => s.status === "In-Progress").length;
  const overdueSchedules = schedules.filter(s => s.status === "Overdue").length;
  
  // Rate = (Completed / (Total Schedules)) * 100
  const completionRate = totalSchedules > 0 
    ? Math.round((completedSchedules / totalSchedules) * 100) 
    : 100;

  // Best Recommendations list
  const gaRecommendations = [
    {
      title: "Integrasi Barcode & QR Code Scanner",
      desc: "Implementasikan label QR Code di setiap fisik barang yang terintegrasi langsung dengan kamera smartphone petugas untuk mengeliminasi kesalahan input manual.",
      impact: "Meningkatkan kecepatan audit hingga 300% dan meminimalkan typo pendataan."
    },
    {
      title: "Threshold Selisih & Auto-Scrap",
      desc: "Terapkan aturan threshold selisih di Google Apps Script: Selisih < Rp 200.000,- dapat di-rekonsiliasi otomatis oleh sistem, sedangkan di atas nominal tersebut wajib melalui approval Direksi.",
      impact: "Mempercepat proses rekonsiliasi operasional bulanan tanpa birokrasi berlebih."
    },
    {
      title: "Offline-First Synchronization",
      desc: "Karena ruang server atau gudang penyimpanan GA seringkali berada di basement dengan sinyal buruk, buat Service Worker untuk menyimpan data hitung fisik di local browser storage (IndexDB) sebelum otomatis di-sync ke Google Sheet saat mendeteksi internet stabil.",
      impact: "Mencegah hilangnya data hitungan lapangan akibat kendala koneksi."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* MODULE HEADER AND SUGGESTIONS SECTION */}
      <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/40 border border-amber-500/10 p-5 rounded-2xl backdrop-blur-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                Modul Terintegrasi Asset Inventory
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-amber-500/30">
                  Tim Baru 5
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Sistem komprehensif Penjadwalan, Pelaksanaan, Metrik Kepatuhan, dan Rekonsiliasi Aset GA</p>
            </div>
          </div>
        </div>

        {/* 3 EXPERT CONTROLS: OFFLINE-FIRST & SYNC STATUS */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Signal Indicator & Switch */}
          <div className={`flex items-center gap-2 p-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all select-none ${
            isOffline 
              ? "bg-red-500/10 text-red-400 border-red-500/20" 
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <span className="text-slate-400">Koneksi:</span>
            <button 
              type="button"
              onClick={() => {
                setIsOffline(!isOffline);
                onAddActivityLog(
                  "Sistem Sinyal", 
                  "Beralih Mode Jaringan", 
                  `Petugas mengubah status koneksi menjadi ${!isOffline ? "OFFLINE (Simulasi Basement)" : "ONLINE (Koneksi Cloud)"}`
                );
              }}
              className="flex items-center gap-1 focus:outline-none hover:opacity-80 active:scale-95 text-xs"
              title="Klik untuk beralih antara simulasi basement (offline) dan cloud (online)"
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span className="text-red-400">Offline (Basement)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Online (Cloud)</span>
                </>
              )}
            </button>
          </div>

          {/* Sync Queue Controller */}
          {localQueue.length > 0 && (
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing || isOffline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isOffline 
                  ? "bg-slate-500/10 text-slate-400 border-white/5 cursor-not-allowed" 
                  : "bg-amber-500 text-black border-amber-400 hover:bg-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : "animate-spin"}`} style={{ animationDuration: isSyncing ? '1s' : '4s' }} />
              <span>Kirim Antrean ({localQueue.length})</span>
            </button>
          )}

          {/* Dynamic Achievements Mini Widget */}
          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Kepatuhan Opname</p>
              <p className="text-xs font-black text-amber-300 font-mono">
                {completionRate}% <span className="text-[10px] text-slate-400 font-normal">Selesai ({completedSchedules}/{totalSchedules})</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Overlay if active */}
      {isSyncing && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 rounded-2xl animate-pulse space-y-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="font-bold text-white">{syncStep}</span>
            </div>
            <span className="font-mono text-amber-300 font-bold">{syncProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab("jadwal")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
            activeSubTab === "jadwal"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Jadwal Stock Opname</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("pelaksanaan");
            // Auto-select first in progress schedule if available
            const inProgress = schedules.find(s => s.status === "In-Progress")?.id;
            if (inProgress) setSelectedScheduleId(inProgress);
          }}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
            activeSubTab === "pelaksanaan"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>2. Pelaksanaan Hitung</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("pencapaian")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
            activeSubTab === "pencapaian"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3. Pencapaian & Analitik</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab("penyesuaian")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 shrink-0 ${
            activeSubTab === "penyesuaian"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>4. Penyesuaian Selisih</span>
            {logs.filter(l => !l.adjusted && l.discrepancy !== 0).length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse ml-1 shrink-0">
                {logs.filter(l => !l.adjusted && l.discrepancy !== 0).length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE MODULE PANEL */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* TAB 1: SCHEDULE MANAGEMENT */}
          {activeSubTab === "jadwal" && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Rencana & Jadwal Stock Opname GA</h3>
                  <p className="text-[10px] text-slate-400">Kalender agenda pemeriksaan fisik aset perusahaan sepanjang tahun 2026</p>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {schedules.length} Agenda Total
                </span>
              </div>

              {/* Form to Plan New Schedule */}
              <form onSubmit={handleCreateSchedule} className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Jadwal Stock Opname Baru</span>
                </div>

                {scheduleSuccess && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Jadwal pemeriksaan berhasil didaftarkan dan dikirim ke log Google Sheets!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[9px] text-slate-400 uppercase font-bold">Judul Agenda Stock Opname</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Opname Alat Dapur Lt. 1 Pantry"
                      value={newScheduleTitle}
                      onChange={(e) => setNewScheduleTitle(e.target.value)}
                      className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold">Bulan Periode</label>
                    <select
                      value={newScheduleMonth}
                      onChange={(e) => setNewScheduleMonth(e.target.value)}
                      className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Juli 2026">Juli 2026</option>
                      <option value="Agustus 2026">Agustus 2026</option>
                      <option value="September 2026">September 2026</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold">Target Aset Diperiksa</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newScheduleItemsCount}
                      onChange={(e) => setNewScheduleItemsCount(Number(e.target.value))}
                      className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-slate-400 uppercase font-bold">Rencana Tanggal Pelaksanaan</label>
                    <input
                      type="date"
                      value={newScheduleDate}
                      onChange={(e) => setNewScheduleDate(e.target.value)}
                      className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-1 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Daftarkan Agenda</span>
                  </button>
                </div>
              </form>

              {/* Schedules list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Agenda Aktif</h4>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {schedules.map((sched) => {
                    const statusColors = {
                      "Completed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      "In-Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      "Scheduled": "bg-slate-500/10 text-slate-400 border-slate-500/20",
                      "Overdue": "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                    };

                    const progressPercent = Math.round((sched.countedItems / sched.totalItems) * 100);

                    return (
                      <div 
                        key={sched.id}
                        className="bg-black/20 border border-white/5 p-3.5 rounded-xl hover:border-white/10 transition-all flex flex-col md:flex-row justify-between md:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sched.title}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColors[sched.status]}`}>
                              {sched.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Periode: <strong className="text-amber-400">{sched.month}</strong> • Target Tanggal: {sched.scheduledDate}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="md:w-48 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Progres Hitung:</span>
                            <span className="text-amber-300 font-bold">{sched.countedItems} / {sched.totalItems} item ({progressPercent}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {sched.status !== "Completed" ? (
                            <button
                              onClick={() => {
                                setSelectedScheduleId(sched.id);
                                setActiveSubTab("pelaksanaan");
                              }}
                              className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1"
                            >
                              <span>Mulai Hitung</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                              <Check className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTE OPNAME (COUNTING INTERFACE) */}
          {activeSubTab === "pelaksanaan" && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Lembar Kerja Pelaksanaan Stock Opname</h3>
                  <p className="text-[10px] text-slate-400">Verifikasi jumlah fisik aset dan laporkan perbedaan secara real-time</p>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono font-bold">
                  Sesi Hitung Lapangan
                </span>
              </div>

              {/* QR CODE SCANNER TRIGGERS & SIMULATOR CARD */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-950/10 to-slate-900/30 border border-emerald-500/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Integrasi Pemindai Label QR Code Aset
                    </h4>
                    <p className="text-[10px] text-slate-400">Pindai sticker QR di barang fisik untuk mencegah salah input data</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showScanner ? "Tutup Scanner" : "Buka Kamera Scan"}</span>
                  </button>
                </div>

                {/* QR Scanner Live Simulation Overlay */}
                {showScanner && (
                  <div className="bg-black/50 border border-emerald-500/25 p-4 rounded-xl space-y-4 animate-fadeIn relative">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        Kamera Scanner Aktif (Simulasi)
                      </div>
                      <p className="text-[9px] text-slate-400">Arahkan kamera HP ke label QR di aset. Klik salah satu label di bawah untuk memindai.</p>
                    </div>

                    {/* Scanner viewfinder mockup */}
                    <div className="relative w-44 h-44 mx-auto bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                      {/* Viewfinder brackets */}
                      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400" />

                      {/* Moving laser scan line */}
                      <div className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-bounce" style={{ top: '35%' }} />

                      <QrCode className="w-16 h-16 text-slate-700 animate-pulse" />
                    </div>

                    {/* Asset Labels Simulated clickable tags */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Pilih sticker QR terdeteksi di lapangan:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-28 overflow-y-auto pr-1">
                        {assets.map(a => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleSimulatedScan(a.id)}
                            className="bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-left p-2 rounded-lg transition-all text-[10px] space-y-0.5 truncate"
                          >
                            <div className="font-bold text-white truncate">{a.name}</div>
                            <div className="text-[8px] text-slate-400 font-mono">{a.id}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanned alert banner */}
                {scannedAssetAlert && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl flex items-center gap-2.5 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">
                      📟 <strong>QR Code Terdeteksi!</strong> Berhasil memindahkan form input ke item: <strong className="text-white">{scannedAssetAlert}</strong>
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleExecuteOpname} className="space-y-4">
                
                {execSuccess && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Laporan hitungan fisik berhasil direkam! Audit trail dicatat ke Google Sheets.</span>
                  </div>
                )}

                {/* Select Schedule & Select Asset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pilih Agenda Opname Aktif</label>
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => setSelectedScheduleId(e.target.value)}
                      className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pilih Agenda --</option>
                      {schedules.filter(s => s.status !== "Completed").map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.month})</option>
                      ))}
                      {/* completed in fallback */}
                      {schedules.filter(s => s.status === "Completed").map(s => (
                        <option key={s.id} value={s.id}>[Selesai] {s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pilih Aset untuk Diverifikasi</label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => handleAssetSelectChange(e.target.value)}
                      className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
                    >
                      {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantities Comparison Board */}
                {selectedAssetId && (() => {
                  const asset = assets.find(a => a.id === selectedAssetId);
                  if (!asset) return null;

                  const diff = countedQty - asset.systemQty;

                  return (
                    <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-4">
                      
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Saldo Sistem (Teoritis)</p>
                          <p className="text-xl font-black text-white font-mono mt-1">{asset.systemQty}</p>
                          <p className="text-[8px] text-slate-500 mt-0.5">Unit tercatat</p>
                        </div>

                        <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                          <p className="text-[9px] text-amber-400 uppercase font-bold">Fisik Lapangan</p>
                          <div className="flex justify-center items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => setCountedQty(Math.max(0, countedQty - 1))}
                              className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={countedQty}
                              onChange={(e) => setCountedQty(Math.max(0, Number(e.target.value)))}
                              className="w-12 bg-black/40 text-center font-mono font-bold text-amber-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setCountedQty(countedQty + 1)}
                              className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white rounded font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-[8px] text-slate-500 mt-0.5">Edit jumlah fisik</p>
                        </div>

                        <div className={`p-3 rounded-lg border ${
                          diff === 0 
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                            : "bg-red-500/5 border-red-500/10 text-red-400"
                        }`}>
                          <p className="text-[9px] uppercase font-bold">Selisih Hitung</p>
                          <p className="text-xl font-black font-mono mt-1">
                            {diff > 0 ? `+${diff}` : diff}
                          </p>
                          <p className="text-[8px] mt-0.5 font-bold">
                            {diff === 0 ? "COCOK / MATCHED" : "VARIAN SELISIH"}
                          </p>
                        </div>
                      </div>

                      {/* If there's a discrepancy, mandate the reason */}
                      {diff !== 0 && (
                        <div className="space-y-1.5 animate-fadeIn">
                          <label className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                            Alasan Terjadi Selisih Saldo Aset (Wajib diisi):
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Barang rusak ditaruh gudang / Salah catat lokasi saat inbound..."
                            value={discrepancyReason}
                            onChange={(e) => setDiscrepancyReason(e.target.value)}
                            className="w-full bg-black/40 border border-red-500/30 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>Lokasi penempatan: <strong>{asset.location}</strong></span>
                        </div>
                        
                        <button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2 rounded-xl transition-all shadow-md active:scale-95"
                        >
                          Kirim Hasil Verifikasi
                        </button>
                      </div>

                    </div>
                  );
                })()}

              </form>
            </div>
          )}

          {/* TAB 3: PERFORMANCE ACHIEVEMENT RATE AND GRAPHS */}
          {activeSubTab === "pencapaian" && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Analisa Pencapaian Stock Opname GA</h3>
                  <p className="text-[10px] text-slate-400">Indikator kinerja kepatuhan tim Asset Inventory terhadap target jadwal</p>
                </div>
                <div className="p-1 text-xs bg-amber-500/10 text-amber-400 font-bold px-2 rounded font-mono border border-amber-500/20">
                  KPI Kepatuhan Jadwal
                </div>
              </div>

              {/* KPI Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl text-center">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Total Agenda</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalSchedules}</p>
                  <p className="text-[8px] text-slate-500 mt-1">Jadwal direncanakan</p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-center">
                  <p className="text-[9px] text-emerald-400 uppercase font-bold">Selesai (Completed)</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{completedSchedules}</p>
                  <p className="text-[8px] text-slate-500 mt-1">Selesai 100% tepat waktu</p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-center">
                  <p className="text-[9px] text-blue-400 uppercase font-bold">Sedang Berjalan</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{inProgressSchedules}</p>
                  <p className="text-[8px] text-slate-500 mt-1">Dihitung di lapangan</p>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-center">
                  <p className="text-[9px] text-red-400 uppercase font-bold">Terlambat (Overdue)</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{overdueSchedules}</p>
                  <p className="text-[8px] text-slate-500 mt-1">Melewati target tanggal</p>
                </div>
              </div>

              {/* Progress and compliance visual gauge */}
              <div className="bg-black/20 border border-white/5 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white">Visualisasi Pencapaian Kepatuhan Jadwal</h4>
                
                <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
                  <div className="relative flex items-center justify-center">
                    {/* Ring Progress SVG */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        className="stroke-amber-400 transition-all duration-1000"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - completionRate / 100)}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-white font-mono">{completionRate}%</span>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Achievement</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 max-w-sm">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Kinerja tim <strong>Asset Inventory</strong> dinilai sangat baik bulan ini dengan tingkat kepatuhan jadwal sebesar <strong>{completionRate}%</strong>. Standard compliance minimal perusahaan adalah <strong>80%</strong>.
                    </p>
                    <div className="flex gap-2 items-center text-[10px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4" />
                      <span>SLA pengerjaan stock opname berada dalam status AMAN (Hijau).</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: RECONCILIATION ADJUSTMENT SCREEN */}
          {activeSubTab === "penyesuaian" && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Otorisasi Penyesuaian Selisih Aset</h3>
                  <p className="text-[10px] text-slate-400">Lakukan rekonsiliasi stok sistem agar sesuai dengan kondisi fisik riil di lapangan</p>
                </div>
                <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-mono font-bold animate-pulse">
                  {logs.filter(l => !l.adjusted && l.discrepancy !== 0).length} Discrepancy
                </span>
              </div>

              {/* THRESHOLD AUTO-RECONCILIATION POLICY CONTROLS */}
              <div className="bg-gradient-to-r from-emerald-950/20 via-slate-900/30 to-slate-900/30 border border-emerald-500/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    Kebijakan Otorisasi Otomatis (Auto-Settle Threshold)
                  </h4>
                  <p className="text-[10px] text-slate-400">Selisih minor di bawah batas unit yang ditentukan dapat di-auto-adjust tanpa approval berjenjang</p>
                </div>

                {/* Threshold adjuster buttons */}
                <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg shrink-0 w-full md:w-auto justify-between md:justify-start">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Batas Selisih:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setThresholdLimit(Math.max(1, thresholdLimit - 1))}
                      className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-all active:scale-90"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-black text-amber-300 w-12 text-center">{thresholdLimit} Unit</span>
                    <button
                      type="button"
                      onClick={() => setThresholdLimit(Math.min(5, thresholdLimit + 1))}
                      className="w-5 h-5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {logs.filter(l => l.discrepancy !== 0).length === 0 ? (
                  <div className="text-center py-8 bg-black/20 rounded-xl border border-white/5 text-xs text-slate-500 italic">
                    Belum ditemukan selisih dari stock opname yang berjalan. Semua stok sistem dan fisik cocok!
                  </div>
                ) : (
                  logs.filter(l => l.discrepancy !== 0).map((log) => {
                    const isEligibleForAuto = !log.adjusted && Math.abs(log.discrepancy) <= thresholdLimit;

                    return (
                      <div 
                        key={log.id} 
                        className={`border p-4 rounded-xl space-y-3 transition-all ${
                          log.adjusted 
                            ? "bg-emerald-500/5 border-emerald-500/10 opacity-70" 
                            : isEligibleForAuto
                              ? "bg-emerald-950/5 border-emerald-500/20 hover:border-emerald-500/40"
                              : "bg-black/30 border-red-500/20 hover:border-red-500/40"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-white">{log.assetName}</h4>
                              {isEligibleForAuto && (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  Batas Minor Cocok
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400">ID: {log.assetId} • Ref Jadwal: {log.scheduleId}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              log.discrepancy < 0 
                                ? "bg-red-500/10 text-red-400" 
                                : "bg-amber-500/10 text-amber-400"
                            }`}>
                              Selisih: {log.discrepancy > 0 ? `+${log.discrepancy}` : log.discrepancy} Unit
                            </span>
                            <p className="text-[9px] text-slate-500 mt-0.5">Sistem: {log.systemQty} vs Fisik: {log.physicalQty}</p>
                          </div>
                        </div>

                        {log.discrepancyReason && (
                          <div className="bg-black/40 border border-white/5 p-2 rounded text-[10px] text-slate-400 leading-relaxed italic">
                            💡 <strong>Alasan Petugas:</strong> &ldquo;{log.discrepancyReason}&rdquo;
                          </div>
                        )}

                        {/* Reconciliation Status / Inputs */}
                        <div className="border-t border-white/5 pt-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                          {log.adjusted ? (
                            <div className="text-[10px] text-emerald-400 flex items-start gap-2 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 flex-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <p className="font-bold">STATUS: RECONCILED / SELESAI DISESUAIKAN</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">Catatan: {log.adjustmentNote}</p>
                                {log.adjustedAt && <p className="text-[8px] text-slate-500 mt-0.2 font-mono">Disetujui pada: {new Date(log.adjustedAt).toLocaleString("id-ID")}</p>}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 flex flex-col gap-1">
                                <label className="text-[9px] text-slate-400 uppercase font-bold">Catatan Otorisasi Penyesuaian</label>
                                <input
                                  type="text"
                                  placeholder="Masukkan instruksi penyesuaian (Contoh: Setuju potong saldo sistem, ajukan scrap...)"
                                  value={adjustmentNotes[log.id] || ""}
                                  onChange={(e) => setAdjustmentNotes(prev => ({ ...prev, [log.id]: e.target.value }))}
                                  className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div className="shrink-0 flex items-stretch sm:items-end gap-2">
                                {isEligibleForAuto && (
                                  <button
                                    type="button"
                                    onClick={() => handleAutoReconcile(log.id)}
                                    className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow active:scale-95"
                                    title="Setujui otomatis berdasarkan kebijakan selisih minor"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Auto-Settle</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleApproveAdjustment(log.id)}
                                  className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Setujui Manual</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {adjustSuccess === log.id && (
                          <div className="text-[9px] text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/20 p-2 rounded text-center animate-pulse">
                            🎉 Saldo Sistem Ter-update! Stok tercatat disesuaikan ke fisik lapangan ({log.physicalQty} unit).
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: RECENT ASSETS LEDGER & EXPERT ADVICES */}
        <div className="space-y-6">
          
          {/* EXPERT RECOMMENDATIONS SIDEBAR */}
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/40 to-slate-900/40 border border-amber-500/20 p-5 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Rekomendasi Terbaik Ahli GA
            </h3>
            
            <p className="text-[11px] text-slate-300 leading-relaxed border-b border-white/5 pb-2">
              Saran arsitektur integrasi sistem modern untuk modul pengelolaan aset dan stock opname:
            </p>

            <div className="space-y-4">
              {gaRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-1.5 hover:border-amber-500/10 transition-all">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                      {idx + 1}
                    </span>
                    {rec.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {rec.desc}
                  </p>
                  <p className="text-[9px] text-amber-400 bg-amber-500/5 p-1.5 rounded border border-amber-500/10 italic leading-snug">
                    📌 <strong>Dampak Operasional:</strong> {rec.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE ASSETS LEDGER CARD */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Buku Register Aset (Ledger)</h3>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                {assets.length} Aset Unik
              </span>
            </div>

            {/* Simple Search bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama aset / lokasi..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-[11px] text-slate-300 rounded-lg pl-9 pr-3 py-1.8 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {assets
                .filter(a => 
                  a.name.toLowerCase().includes(assetSearch.toLowerCase()) || 
                  a.location.toLowerCase().includes(assetSearch.toLowerCase())
                )
                .map((asset) => {
                  
                  const statusColors = {
                    "In-Use": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    "Stored": "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    "Damaged": "text-red-400 bg-red-500/10 border-red-500/20",
                    "Lost": "text-slate-400 bg-slate-500/10 border-slate-500/20"
                  };

                  return (
                    <div key={asset.id} className="bg-black/30 border border-white/5 p-3 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[11px] font-bold text-white leading-tight">{asset.name}</h4>
                          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">{asset.category} • ID: {asset.id}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${statusColors[asset.status]}`}>
                          {asset.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-1.5 font-mono">
                        <span className="text-slate-400">Lokasi: <strong className="text-slate-300">{asset.location}</strong></span>
                        <span className="text-amber-300 font-bold">Qty: {asset.systemQty} Unit</span>
                      </div>

                      <div className="text-[8px] text-slate-500 text-right">
                        Terakhir di-opname: {new Date(asset.lastOpnameDate).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
