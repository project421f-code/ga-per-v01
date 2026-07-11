import React, { useState, useEffect } from "react";
import { 
  Team, 
  TaskStatus, 
  Priority, 
  Task, 
  ActivityLog, 
  KPIStats,
  StakeholderSurvey,
  AssetItem,
  OpnameSchedule,
  OpnameLog
} from "./types";
import { 
  initialTasks, 
  initialLogs, 
  initialSurveys,
  initialAssets,
  initialOpnameSchedules,
  initialOpnameLogs
} from "./mockData";
import StakeholderSurveysView from "./components/StakeholderSurveysView";
import AssetManagementView from "./components/AssetManagementView";
import KosManagementView from "./components/KosManagementView";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";
import { createTask, updateTaskStatus } from "./services/dataService";
import { 
  Home, 
  Sparkles, 
  Clock, 
  Plus, 
  CheckCircle, 
  Play, 
  Check, 
  Star, 
  AlertTriangle, 
  Award, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Users, 
  Smartphone,
  CheckSquare,
  Zap,
  Boxes,
  Ticket
} from "lucide-react";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  
  // Check if demo mode (via URL param ?demo=1)
  const isDemoMode = new URLSearchParams(window.location.search).get("demo") === "1";
  const isAuthenticated = !!user || isDemoMode;
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [surveys, setSurveys] = useState<StakeholderSurvey[]>(initialSurveys);
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets);
  const [schedules, setSchedules] = useState<OpnameSchedule[]>(initialOpnameSchedules);
  const [opnameLogs, setOpnameLogs] = useState<OpnameLog[]>(initialOpnameLogs);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "tickets" | "assets" | "surveys" | "kos">("dashboard");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<Team | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "ALL">("ALL");
  
  // New Task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTeam, setNewTeam] = useState<Team>(Team.MAINTENANCE);
  const [newLocation, setNewLocation] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>(Priority.MEDIUM);
  const [newSlaMinutes, setNewSlaMinutes] = useState(120);
  const [newReporter, setNewReporter] = useState("");

  // Verification CSAT State
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);



  // Time & Live Activity Counter
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Clock tick
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auth guard: show loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Auth guard: not logged in and not demo mode
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Calculate live KPI stats based on active tasks
  const getKPIStats = (): KPIStats => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const verifiedTasks = tasks.filter(t => t.status === TaskStatus.VERIFIED).length;
    
    // CSAT calculation
    const ratedTasks = tasks.filter(t => t.feedbackRating !== undefined);
    const avgCsat = ratedTasks.length > 0
      ? Number((ratedTasks.reduce((sum, t) => sum + (t.feedbackRating || 0), 0) / ratedTasks.length).toFixed(1))
      : 4.5; // defaults standard

    // SLA compliance %
    const closedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VERIFIED);
    const compliedTasks = closedTasks.filter(t => {
      if (t.actualMinutes && t.actualMinutes <= t.slaMinutes) return true;
      if (!t.actualMinutes) return true; // fallback
      return false;
    });
    const slaCompliance = closedTasks.length > 0
      ? Math.round((compliedTasks.length / closedTasks.length) * 100)
      : 90;

    // Avg response time (simulated)
    const avgResponseTime = Math.round(
      tasks.reduce((sum, t) => sum + (t.actualMinutes ? Math.min(t.actualMinutes / 3, t.slaMinutes / 2) : 15), 0) / totalTasks
    );

    // Completion rate
    const completionRate = totalTasks > 0
      ? Math.round(((completedTasks + verifiedTasks) / totalTasks) * 100)
      : 100;

    // Stakeholder satisfaction calculation
    const totalSurveysCount = surveys.length;
    let totalStakeholderScoreSum = 0;
    let ratingsCount = 0;
    surveys.forEach(srv => {
      Object.values(srv.ratings).forEach(rating => {
        totalStakeholderScoreSum += Number(rating);
        ratingsCount++;
      });
    });
    const stakeholderSatisfactionScore = ratingsCount > 0
      ? Number((totalStakeholderScoreSum / ratingsCount).toFixed(2))
      : 4.6; // default fallback

    return {
      csat: avgCsat,
      avgResponseTime,
      completionRate,
      slaCompliance,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      verifiedTasks,
      stakeholderSatisfactionScore,
      totalSurveysCount
    };
  };

  const kpis = getKPIStats();

  // Handle task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim() || !newReporter.trim()) return;

    const prefix = newTeam === Team.MAINTENANCE ? "MNT" 
                 : newTeam === Team.HOUSEKEEPING ? "HKP" 
                 : newTeam === Team.SECURITY ? "SEC" 
                 : newTeam === Team.CLEANING_SERVICE ? "CLS" 
                 : "AST";
    const taskId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newTask: Task = {
      id: taskId,
      title: newTitle,
      description: newDesc,
      team: newTeam,
      reporter: newReporter,
      location: newLocation,
      priority: newPriority,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaMinutes: Number(newSlaMinutes),
    };

    // Simpan ke lokal state & kirim ke Google Sheets via GAS
    setTasks([newTask, ...tasks]);
    const result = await createTask(newTask);
    if (result.log) setLogs([result.log, ...logs]);

    // reset forms
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
    setNewReporter("");
    setShowAddForm(false);
  };

  // State transitions: Pending -> In-Progress -> Completed -> Verifying/Verified
  const handleTransitionStatus = async (taskId: string, nextStatus: TaskStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        let actualMin = task.actualMinutes;
        let completedTime = task.completedAt;
        
        if (nextStatus === TaskStatus.COMPLETED) {
          // Calculate realistic duration based on minutes elapsed
          const createdDate = new Date(task.createdAt);
          const minutesElapsed = Math.max(10, Math.round((new Date().getTime() - createdDate.getTime()) / 60000));
          // make actual duration fall roughly within or slightly outside SLA for realism
          actualMin = Math.min(minutesElapsed, Math.round(task.slaMinutes * (0.6 + Math.random() * 0.6)));
          completedTime = new Date().toISOString();
        }

        return {
          ...task,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          actualMinutes: actualMin,
          completedAt: completedTime
        };
      }
      return task;
    });

    // Kirim update status ke Google Sheets via GAS
    const targetTask = tasks.find(t => t.id === taskId);
    let actualMinutes: number | undefined;
    let completedAt: string | undefined;
    if (nextStatus === TaskStatus.COMPLETED && targetTask) {
      const createdDate = new Date(targetTask.createdAt);
      actualMinutes = Math.min(
        Math.max(10, Math.round((new Date().getTime() - createdDate.getTime()) / 60000)),
        Math.round(targetTask.slaMinutes * (0.6 + Math.random() * 0.6))
      );
      completedAt = new Date().toISOString();
    }
    const statusResult = await updateTaskStatus(taskId, nextStatus, actualMinutes, completedAt);
    if (statusResult.log) setLogs([statusResult.log, ...logs]);

    setTasks(updatedTasks);
  };

  // Submit feedback & CSAT rating to verify a completed task
  const handleVerifyTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: TaskStatus.VERIFIED,
          feedbackRating: selectedRating,
          updatedAt: new Date().toISOString()
        };
      }
      return task;
    });

    // Kirim verifikasi + rating ke Google Sheets via GAS
    const verifyResult = await updateTaskStatus(taskId, TaskStatus.VERIFIED, undefined, undefined, selectedRating);
    if (verifyResult.log) setLogs([verifyResult.log, ...logs]);

    setTasks(updatedTasks);
    setVerifyingTaskId(null);
  };

  // Live simulation event generator
  const triggerSimulationEvent = () => {
    const events = [
      {
        title: "Tumpahan Air AC Koridor Depan Server",
        description: "Ada genangan air kondensasi AC cukup banyak di lantai kayu, berpotensi terpeleset.",
        team: Team.CLEANING_SERVICE,
        location: "Lorong Lt. 3 Sayap Kiri",
        priority: Priority.HIGH,
        slaMinutes: 30,
        reporter: "Dewi Safitri (SysAdmin)"
      },
      {
        title: "Gagang Pintu Toilet Lantai 2 Longgar",
        description: "Gagang pintu stainless toilet wanita lepas saat diputar, butuh kencangkan sekrup.",
        team: Team.MAINTENANCE,
        location: "Toilet Wanita (Lt. 2)",
        priority: Priority.LOW,
        slaMinutes: 180,
        reporter: "Clara (Marketing)"
      },
      {
        title: "Kunjungan Tamu Eksekutif Kemenperin",
        description: "Butuh pengamanan ekstra dan sterilisasi slot parkir VIP nomor 1 sampai 3 pagi ini.",
        team: Team.SECURITY,
        location: "Drop-off Utama & Parkiran VIP",
        priority: Priority.HIGH,
        slaMinutes: 45,
        reporter: "Rudi Santoso (GA Supervisor)"
      },
      {
        title: "Stok Hand Sanitizer Habis di Seluruh Lift",
        description: "Botol pump di dalam lift penumpang 1, 2, dan lift barang terpantau kosong melompong.",
        team: Team.HOUSEKEEPING,
        location: "Gedung Utama (Lift Lobby)",
        priority: Priority.MEDIUM,
        slaMinutes: 60,
        reporter: "Anton (Procurement)"
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const taskId = `${randomEvent.team === Team.MAINTENANCE ? "MNT" : randomEvent.team === Team.HOUSEKEEPING ? "HKP" : randomEvent.team === Team.SECURITY ? "SEC" : "CLS"}-${Math.floor(100 + Math.random() * 900)}`;

    const simulatedTask: Task = {
      id: taskId,
      title: randomEvent.title,
      description: randomEvent.description,
      team: randomEvent.team,
      reporter: randomEvent.reporter,
      location: randomEvent.location,
      priority: randomEvent.priority,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaMinutes: randomEvent.slaMinutes,
    };

    const simulatedLog: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      taskId: taskId,
      team: randomEvent.team,
      actor: randomEvent.reporter,
      action: "Sistem Otomatis (SIMULASI)",
      timestamp: new Date().toISOString(),
      details: `[ALARM REACTIONAL] Kejadian luar biasa dideteksi otomatis: ${randomEvent.title}. Tiket dibuat.`
    };

    setTasks([simulatedTask, ...tasks]);
    setLogs([simulatedLog, ...logs]);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesTeam = selectedTeamFilter === "ALL" || task.team === selectedTeamFilter;
    const matchesPriority = selectedPriority === "ALL" || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === "ALL" || task.status === selectedStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesPriority && matchesStatus && matchesSearch;
  });

  // Dynamic colors helper
  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.HIGH:
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">HIGH</span>;
      case Priority.MEDIUM:
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">MEDIUM</span>;
      case Priority.LOW:
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">LOW</span>;
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case TaskStatus.PENDING:
        return <span className="bg-slate-500/20 text-slate-300 border border-slate-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pending</span>;
      case TaskStatus.IN_PROGRESS:
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">In Progress</span>;
      case TaskStatus.COMPLETED:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>;
      case TaskStatus.VERIFIED:
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified ✓</span>;
    }
  };

  const getTeamEmoji = (team: Team) => {
    switch (team) {
      case Team.MAINTENANCE: return "🛠️";
      case Team.HOUSEKEEPING: return "🏠";
      case Team.SECURITY: return "🛡️";
      case Team.CLEANING_SERVICE: return "🧹";
      case Team.ASSET_INVENTORY: return "📦";
    }
  };

  // Group task count for sidebar
  const getTeamCount = (team: Team) => {
    return tasks.filter(t => t.team === team && t.status !== TaskStatus.VERIFIED).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[55%] h-[50%] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[15%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* ===== SIDEBAR NAVIGATION ===== */}
      <aside className="relative z-10 w-16 md:w-56 shrink-0 border-r border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col items-center md:items-stretch py-4 gap-1 min-h-screen sticky top-0">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-stretch px-0 md:px-3 mb-4">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-[13px] font-bold leading-tight text-white">GA Performance</h1>
              <p className="text-[7px] text-slate-500 uppercase tracking-widest font-mono leading-tight">Dashboard</p>
            </div>
          </div>
          <div className="hidden md:block border-b border-white/10 mt-3 mb-1" />
        </div>

        {/* Nav Items */}
        <nav className="flex flex-row md:flex-col items-stretch gap-1 px-1 md:px-2 w-full">
          {[
            { key: "dashboard", icon: Smartphone, label: "Dashboard", color: "text-indigo-400" },
            { key: "tickets", icon: Ticket, label: "Laporan Tiket", color: "text-red-400" },
            { key: "surveys", icon: Users, label: "Survey", color: "text-yellow-400" },
            { key: "assets", icon: Boxes, label: "Aset & Opname", color: "text-amber-400" },
            { key: "kos", icon: Home, label: "Kos GA", color: "text-amber-400" },
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentTab(item.key as any)}
                className={`flex items-center justify-center md:justify-start gap-2.5 px-2 md:px-3 py-2.5 md:py-2 rounded-xl text-xs font-semibold transition-all relative group ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm border border-white/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full hidden md:block" />}
                <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                <span className="hidden md:inline text-[11px]">{item.label}</span>
                {/* Tooltip on mobile */}
                <span className="md:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="hidden md:block mt-auto px-3 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[9px] text-slate-500">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-mono">LIVE</span>
            <span className="font-mono">{currentTime || "00:00"}</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen">

      {/* Simplified Top Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-slate-900/30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="md:hidden w-8 h-8 bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-white">GA Performance & KPI Dashboard</h1>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">
              SISTEM DIGITALISASI OPERASIONAL GENERAL AFFAIR
            </p>
          </div>
          <span className="hidden sm:inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[8px] font-bold px-1.5 py-0.5 rounded">
            GAS INTEGRATED
          </span>
        </div>

        {/* System status live widget */}
        <div className="flex items-center gap-3">
          <div className="text-right text-[11px]">
            <p className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              LIVE
            </p>
            <p className="text-[9px] text-slate-500 font-mono tracking-tight">{currentTime || "00:00:00"}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center font-bold text-xs text-slate-300">
            GA
          </div>
        </div>
      </header>

      {/* Main Content Workspace Container */}
      <main className="relative z-10 flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        
        {currentTab === "assets" ? (
          /* ASSET MANAGEMENT MODULE */
          <div className="flex-1">
            <AssetManagementView 
              assets={assets}
              schedules={schedules}
              logs={opnameLogs}
              onAddSchedule={(newSched) => setSchedules([newSched, ...schedules])}
              onUpdateAssetQty={(assetId, newQty) => {
                setAssets(prev => prev.map(a => a.id === assetId ? { ...a, systemQty: newQty, physicalQty: newQty, lastOpnameDate: new Date().toISOString() } : a));
              }}
              onUpdateScheduleCount={(scheduleId, counted, isComplete) => {
                setSchedules(prev => prev.map(s => s.id === scheduleId ? { 
                  ...s, 
                  countedItems: counted, 
                  status: isComplete ? "Completed" : "In-Progress",
                  completedDate: isComplete ? new Date().toISOString() : undefined 
                } : s));
              }}
              onAddOpnameLog={(newLog) => setOpnameLogs([newLog, ...opnameLogs])}
              onAdjustDiscrepancy={(logId, note) => {
                setOpnameLogs(prev => prev.map(l => l.id === logId ? { 
                  ...l, 
                  adjusted: true, 
                  adjustmentNote: note, 
                  adjustedAt: new Date().toISOString() 
                } : l));
              }}
              onAddActivityLog={(actor, action, details) => {
                const newActivity: ActivityLog = {
                  id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                  actor,
                  action,
                  timestamp: new Date().toISOString(),
                  details
                };
                setLogs([newActivity, ...logs]);
              }}
            />
          </div>
        ) : currentTab === "surveys" ? (
          /* STAKEHOLDER SURVEY MODULE */
          <div className="flex-1">
            <div className="mb-4 bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-300">
                Halaman ini memuat Modul Survey Kepuasan Stakeholder Bulanan. Para Kepala Divisi atau Stakeholder Utama dapat mengisi survey kinerja 4 departemen GA dan memberikan kritik saran korektif yang langsung diintegrasikan ke perhitungan KPI Terintegrasi GA (bobot 40%).
              </p>
            </div>
            <StakeholderSurveysView 
              surveys={surveys}
              onAddSurvey={(newSrv) => {
                setSurveys([newSrv, ...surveys]);
                const newActivity: ActivityLog = {
                  id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                  actor: newSrv.stakeholderName,
                  action: "Survey Kepuasan",
                  timestamp: new Date().toISOString(),
                  details: `Mengisi survey kepuasan bulanan GA (${newSrv.month}) dari divisi ${newSrv.department}. Rata-rata skor: ${(Object.values(newSrv.ratings).reduce((a, b) => a + b, 0) / 4).toFixed(1)}/5.`
                };
                setLogs([newActivity, ...logs]);
              }}
            />
          </div>
        ) : currentTab === "kos" ? (
          /* BOARDING HOUSE (KOS) MANAGEMENT MODULE */
          <div className="flex-1">
            <KosManagementView />
          </div>
        ) : currentTab === "tickets" ? (
          /* ===== LAPORAN TIKET MODULE ===== */
          <>
            {/* Simulator Bar */}
            <div className="p-4 bg-gradient-to-r from-red-950/30 to-slate-900/30 border border-red-500/20 rounded-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Manajemen Laporan Tiket GA
                  </h3>
                  <p className="text-xs text-slate-300">
                    Kelola semua tiket operasional, lacak status, dan verifikasi penyelesaian pekerjaan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={triggerSimulationEvent}
                  className="w-full md:w-auto bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulasi Laporan Masuk</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              
              {/* DIGITAL TASK BOARD */}
              <div className="flex flex-col gap-4">
                
                {/* Header controls */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari ID, Judul, Lokasi, Deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 font-sans"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all border border-white/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Tiket Laporan Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Team tabs */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      onClick={() => setSelectedTeamFilter("ALL")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedTeamFilter === "ALL"
                          ? "bg-white/15 text-white border border-white/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      🌟 Semua Tim ({tasks.length})
                    </button>
                    {Object.values(Team).map(team => {
                      const count = getTeamCount(team);
                      return (
                        <button
                          key={team}
                          onClick={() => setSelectedTeamFilter(team)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            selectedTeamFilter === team
                              ? "bg-white/15 text-white border border-white/20"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                        >
                          <span>{getTeamEmoji(team)}</span>
                          <span>{team}</span>
                          {count > 0 && (
                            <span className="bg-red-500/30 text-red-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Filtering */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Saring:</span>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as any)}
                      className="bg-black/40 border border-white/10 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-sans"
                    >
                      <option value="ALL">Prioritas: Semua</option>
                      <option value={Priority.HIGH}>Tinggi</option>
                      <option value={Priority.MEDIUM}>Sedang</option>
                      <option value={Priority.LOW}>Rendah</option>
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as any)}
                      className="bg-black/40 border border-white/10 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-red-500 font-sans"
                    >
                      <option value="ALL">Status: Semua</option>
                      <option value={TaskStatus.PENDING}>Pending</option>
                      <option value={TaskStatus.IN_PROGRESS}>In-Progress</option>
                      <option value={TaskStatus.COMPLETED}>Completed</option>
                      <option value={TaskStatus.VERIFIED}>Verified</option>
                    </select>
                  </div>
                </div>

                {/* Create form */}
                {showAddForm && (
                  <form onSubmit={handleCreateTask} className="bg-slate-900/80 border border-red-500/30 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-red-400" />
                        Formulir Pelaporan Baru
                      </h3>
                      <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-200 text-xs">Batal</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" required placeholder="Judul Kendala" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500" />
                      <input type="text" required placeholder="Lokasi" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500" />
                      <input type="text" required placeholder="Nama Pelapor" value={newReporter} onChange={(e) => setNewReporter(e.target.value)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500" />
                      <select value={newTeam} onChange={(e) => setNewTeam(e.target.value as Team)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500">
                        {Object.values(Team).map(team => <option key={team} value={team}>{team}</option>)}
                      </select>
                      <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500">
                        <option value={Priority.LOW}>Rendah</option>
                        <option value={Priority.MEDIUM}>Sedang</option>
                        <option value={Priority.HIGH}>Tinggi</option>
                      </select>
                      <input type="number" required min={15} value={newSlaMinutes} onChange={(e) => setNewSlaMinutes(Number(e.target.value))} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500 font-mono" />
                    </div>
                    <textarea rows={2} placeholder="Deskripsi detail..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-red-500" />
                    <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-white/10 self-end">Kirim Laporan</button>
                  </form>
                )}

                {/* Task list */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                      <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs">Tidak ada tiket yang cocok.</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-red-400 tracking-wider">[{task.id}]</span>
                            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">{getTeamEmoji(task.team)} {task.team}</span>
                            {getPriorityBadge(task.priority)}
                            {getStatusBadge(task.status)}
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{task.title}</h4>
                          <p className="text-xs text-slate-300 mb-3">{task.description}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-400 border-t border-white/5 pt-2.5">
                            <div><span className="text-[9px] text-slate-500 block uppercase font-mono">LOKASI</span><span className="text-slate-300 font-semibold">{task.location}</span></div>
                            <div><span className="text-[9px] text-slate-500 block uppercase font-mono">PELAPOR</span><span className="text-slate-300">{task.reporter}</span></div>
                            <div><span className="text-[9px] text-slate-500 block uppercase font-mono">SLA</span><span className="font-mono text-red-300 font-bold">{task.slaMinutes} Menit</span></div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 min-w-[170px] shrink-0">
                          <div className="text-right w-full mb-3 md:mb-0">
                            {task.status === TaskStatus.VERIFIED && task.feedbackRating !== undefined && (
                              <div className="flex items-center gap-1 justify-end"><span className="text-xs text-slate-400">Kepuasan:</span>
                                <div className="flex text-yellow-400">{Array.from({ length: task.feedbackRating }).map((_, i) => (<Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />))}</div>
                              </div>
                            )}
                            {task.actualMinutes !== undefined && (
                              <div className="mt-1">
                                <p className="text-[10px] text-slate-500">Selesai dalam: <strong className="font-mono text-slate-300">{task.actualMinutes} menit</strong></p>
                                {task.actualMinutes <= task.slaMinutes ? <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">✓ MEMENUHI SLA</span> : <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">🚨 OVER SLA</span>}
                              </div>
                            )}
                          </div>
                          <div className="w-full">
                            {task.status === TaskStatus.PENDING && (
                              <button onClick={() => handleTransitionStatus(task.id, TaskStatus.IN_PROGRESS)} className="w-full bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"><Play className="w-3.5 h-3.5" /><span>Mulai Kerja</span></button>
                            )}
                            {task.status === TaskStatus.IN_PROGRESS && (
                              <button onClick={() => handleTransitionStatus(task.id, TaskStatus.COMPLETED)} className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"><Check className="w-3.5 h-3.5" /><span>Tandai Selesai</span></button>
                            )}
                            {task.status === TaskStatus.COMPLETED && (
                              <div className="w-full space-y-1">
                                {verifyingTaskId === task.id ? (
                                  <div className="bg-black/50 p-2 rounded-lg border border-white/10 space-y-2">
                                    <p className="text-[10px] text-center text-slate-300">Rating CSAT:</p>
                                    <div className="flex justify-center gap-1">
                                      {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setSelectedRating(star)} className={`hover:scale-110 transition-transform ${selectedRating >= star ? "text-yellow-400" : "text-slate-600"}`}>
                                          <Star className={`w-5 h-5 ${selectedRating >= star ? "fill-yellow-400" : ""}`} />
                                        </button>
                                      ))}
                                    </div>
                                    <button onClick={() => handleVerifyTask(task.id)} className="w-full bg-blue-600 text-white font-bold text-[10px] py-1 rounded hover:bg-blue-500 transition-colors">Simpan & Verifikasi</button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setVerifyingTaskId(task.id); setSelectedRating(5); }} className="w-full bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse"><CheckCircle className="w-3.5 h-3.5" /><span>Verifikasi Karyawan</span></button>
                                )}
                              </div>
                            )}
                            {task.status === TaskStatus.VERIFIED && (
                              <span className="w-full py-1 text-center text-slate-500 text-[11px] block border border-dashed border-white/10 rounded-lg">Selesai & Terverifikasi</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          /* DASHBOARD - HANYA KPI METRIK */
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                Ringkasan KPI & Metrik GA
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Pantauan real-time performa operasional seluruh tim General Affair</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CSAT LAPANGAN</span>
                  <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400"><Star className="w-4 h-4 fill-yellow-400" /></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-white">{kpis.csat}</span><span className="text-xs text-slate-400">/ 5.0</span></div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /><span>Rating harian pelapor</span></div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">WAKTU RESPONS</span>
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400"><Clock className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-white">{kpis.avgResponseTime}</span><span className="text-xs text-slate-400">Menit</span></div>
                  <p className="text-[10px] text-emerald-400 mt-1">⚡ Respons cepat digital</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">KEPATUHAN SLA</span>
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckSquare className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-white">{kpis.slaCompliance}%</span></div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${kpis.slaCompliance}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">CSAT STAKEHOLDER</span>
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Users className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-white">{kpis.stakeholderSatisfactionScore}</span><span className="text-xs text-slate-400">/ 5.0</span></div>
                  <p className="text-[10px] text-indigo-300 mt-1">👥 {kpis.totalSurveysCount} Survey</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">BEBAN TIKET</span>
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400"><Zap className="w-4 h-4" /></div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2"><span className="text-3xl font-bold tracking-tight text-white">{kpis.pendingTasks + kpis.inProgressTasks}</span><span className="text-xs text-slate-400">Aktif dari {kpis.totalTasks}</span></div>
                  <p className="text-[10px] text-slate-400 mt-1">{kpis.completedTasks} Verif • {kpis.verifiedTasks} Selesai</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Status Bar Footer */}
      <footer className="h-10 bg-black/50 border-t border-white/10 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 py-2 sm:py-0 shrink-0">
        <div className="flex gap-4 sm:gap-6">
          <span>DB STATUS: <span className="text-emerald-400 font-bold">CONNECTED</span></span>
          <span className="hidden sm:inline">|</span>
          <span>INTEGRATION SERVICE: <span className="text-slate-300">GOOGLE APPS SCRIPT (GAS) ACTIVE</span></span>
        </div>
        <div className="flex gap-4 sm:gap-6 font-mono">
          <span>REGION: ASIA-SOUTHEAST1</span>
          <span className="text-slate-400">LAST LIVE SYNC: {currentTime || "00:00:00"}</span>
        </div>
      </footer>

      </div>{/* End main area wrapper */}

    </div>
  );
}
