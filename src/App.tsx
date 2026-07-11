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
import PRDViewer from "./components/PRDViewer";
import StakeholderSurveysView from "./components/StakeholderSurveysView";
import AssetManagementView from "./components/AssetManagementView";
import KosManagementView from "./components/KosManagementView";
import MarkdownRenderer from "./components/MarkdownRenderer";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./context/AuthContext";
import { isGasConfigured, fetchAiAnalysis } from "./services/dataService";
import { 
  Wrench, 
  Home, 
  Shield, 
  Sparkles, 
  Clock, 
  Plus, 
  CheckCircle, 
  Play, 
  Check, 
  Star, 
  AlertTriangle, 
  RefreshCw, 
  Award, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  FileText,
  Smartphone,
  CheckSquare,
  Zap,
  Info,
  Boxes
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
  const [currentTab, setCurrentTab] = useState<"dashboard" | "assets" | "surveys" | "kos" | "prd">("dashboard");
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

  // AI Advisor State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
  const handleCreateTask = (e: React.FormEvent) => {
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

    const newActivity: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      taskId: taskId,
      team: newTeam,
      actor: newReporter,
      action: "Membuat Tiket",
      timestamp: new Date().toISOString(),
      details: `${newTitle} dilaporkan di ${newLocation} (SLA target ${newSlaMinutes} menit).`
    };

    setTasks([newTask, ...tasks]);
    setLogs([newActivity, ...logs]);

    // reset forms
    setNewTitle("");
    setNewDesc("");
    setNewLocation("");
    setNewReporter("");
    setShowAddForm(false);
  };

  // State transitions: Pending -> In-Progress -> Completed -> Verifying/Verified
  const handleTransitionStatus = (taskId: string, nextStatus: TaskStatus) => {
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

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      let actionStr = "";
      let detailsStr = "";
      const actorName = "Staff Lapangan";

      if (nextStatus === TaskStatus.IN_PROGRESS) {
        actionStr = "Mulai Pengerjaan";
        detailsStr = `Tim operasional memulai penanganan kerusakan/tugas di lokasi ${targetTask.location}.`;
      } else if (nextStatus === TaskStatus.COMPLETED) {
        actionStr = "Selesai Pengerjaan";
        detailsStr = `Pekerjaan fisik selesai dilakukan di lapangan. Menunggu verifikasi kualitas dari Pelapor.`;
      }

      const newActivity: ActivityLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        taskId: taskId,
        team: targetTask.team,
        actor: actorName,
        action: actionStr,
        timestamp: new Date().toISOString(),
        details: detailsStr
      };

      setLogs([newActivity, ...logs]);
    }

    setTasks(updatedTasks);
  };

  // Submit feedback & CSAT rating to verify a completed task
  const handleVerifyTask = (taskId: string) => {
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

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const newActivity: ActivityLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        taskId: taskId,
        team: targetTask.team,
        actor: targetTask.reporter,
        action: "Verifikasi Tiket",
        timestamp: new Date().toISOString(),
        details: `Karyawan memverifikasi pengerjaan dengan tingkat kepuasan bintang ${selectedRating}/5.`
      };
      setLogs([newActivity, ...logs]);
    }

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

  // Run AI Operations Analysis using Gemini
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setAiAnalysis("");

    // Aggregate statistics per team
    const teamStats: Record<string, { total: number; done: number; rate: number; avgRating: number }> = {};
    Object.values(Team).forEach(team => {
      const teamTasks = tasks.filter(t => t.team === team);
      const total = teamTasks.length;
      const done = teamTasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VERIFIED).length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      
      const rated = teamTasks.filter(t => t.feedbackRating !== undefined);
      const avgRating = rated.length > 0 
        ? Number((rated.reduce((s, t) => s + (t.feedbackRating || 0), 0) / rated.length).toFixed(1))
        : 4.5;

      teamStats[team] = { total, done, rate, avgRating };
    });

    try {
      const payload = {
        metrics: {
          csat: kpis.csat,
          avgResponseTime: kpis.avgResponseTime,
          completionRate: kpis.completionRate,
          slaCompliance: kpis.slaCompliance,
          maintenanceSla: teamStats[Team.MAINTENANCE]?.rate || 80,
          cleaningCompliance: teamStats[Team.CLEANING_SERVICE]?.rate || 90,
        },
        teamStats,
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          team: t.team,
          priority: t.priority,
          status: t.status,
          location: t.location,
          slaMinutes: t.slaMinutes,
          actualMinutes: t.actualMinutes,
          rating: t.feedbackRating
        }))
      };

      const data = await fetchAiAnalysis(payload);
      if (data.success) {
        setAiAnalysis(data.analysis || "");
      } else {
        if (data.fallbackAnalysis) {
          setAiAnalysis(data.fallbackAnalysis);
          setApiError(data.error || "Gagal Memanggil API");
        } else {
          setApiError(data.error || "Gagal menganalisis data.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Terjadi kesalahan jaringan saat menghubungi server.");
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[55%] h-[50%] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[15%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Main Navigation Header */}
      <header className="relative z-10 h-18 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/45 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-blue-500 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">GA Performance & KPI Dashboard</h1>
              <span className="hidden sm:inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                GAS INTEGRATED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              SISTEM DIGITALISASI OPERASIONAL GENERAL AFFAIR
            </p>
          </div>
        </div>

        {/* View Toggles & Clock */}
        <div className="flex items-center gap-4">
          {/* Main Navigation Toggles */}
          <div className="bg-black/40 border border-white/10 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "dashboard"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aplikasi Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentTab("surveys")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "surveys"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-yellow-400" />
              <span>Survey Stakeholder</span>
            </button>
            <button
              onClick={() => setCurrentTab("assets")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "assets"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              <span>Aset & Stock Opname</span>
            </button>
            <button
              onClick={() => setCurrentTab("kos")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "kos"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Pengelolaan Kos GA</span>
            </button>
            <button
              onClick={() => setCurrentTab("prd")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === "prd"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dokumen PRD Resmi</span>
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

          {/* System status live widget */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                LIVE SIMULATION
              </p>
              <p className="text-[10px] text-slate-500 font-mono tracking-tight">{currentTime || "00:00:00"}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center font-bold text-slate-300">
              GA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace Container */}
      <main className="relative z-10 flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        
        {currentTab === "prd" ? (
          /* INTEGRATED PRD VIEWER */
          <div className="flex-1">
            <div className="mb-4 bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-300">
                Halaman ini memuat dokumen spesifikasi formal (PRD) dari aplikasi ini. Dokumen ini menjadi acuan utama pengembangan sistem digitalisasi General Affair kami. Anda dapat beralih ke <strong>Aplikasi Dashboard</strong> di menu atas untuk berinteraksi dengan demo fungsional.
              </p>
            </div>
            <PRDViewer />
          </div>
        ) : currentTab === "assets" ? (
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
        ) : (
          /* CORE GA OPERATIONS APP & SIMULATOR */
          <>
            {/* Top Stat KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Card 1: CSAT */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">CSAT LAPANGAN</span>
                  <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{kpis.csat}</span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Rating harian pelapor</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Average Response Time */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">WAKTU RESPONS (SLA)</span>
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{kpis.avgResponseTime}</span>
                    <span className="text-xs text-slate-400">Menit</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1">
                    ⚡ Respons cepat digital
                  </p>
                </div>
              </div>

              {/* Card 3: SLA Compliance */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">KEPATUHAN SLA</span>
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{kpis.slaCompliance}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.slaCompliance}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Stakeholder Satisfaction (Monthly Survey) */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">CSAT STAKEHOLDER</span>
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">{kpis.stakeholderSatisfactionScore}</span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                  </div>
                  <p className="text-[10px] text-indigo-300 mt-1">
                    👥 {kpis.totalSurveysCount} Survey Bulanan KPI
                  </p>
                </div>
              </div>

              {/* Card 5: Total & Active Tasks */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">BEBAN TIKET</span>
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">
                      {kpis.pendingTasks + kpis.inProgressTasks}
                    </span>
                    <span className="text-xs text-slate-400">Aktif dari {kpis.totalTasks}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {kpis.completedTasks} Verif • {kpis.verifiedTasks} Selesai
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Live Simulator Bar & Instruction */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-slate-900/60 border border-indigo-500/30 rounded-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Live Field Activity Simulator
                  </h3>
                  <p className="text-xs text-slate-300">
                    Gunakan tombol untuk mensimulasikan pelaporan masalah lapangan acak secara real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={triggerSimulationEvent}
                  className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simulasi Laporan Masuk</span>
                </button>
              </div>
            </div>

            {/* Primary Columns: Left Control Board / Tasks vs Right Analytics / AI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUMN 1 & 2: DIGITAL TASK BOARD */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Header controls inside frosted glass */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex flex-col gap-4">
                  
                  {/* Row 1: Search & Add Trigger */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari ID, Judul, Lokasi, Deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all border border-white/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Tiket Laporan Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Operational Team Category Tabs */}
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
                            <span className="bg-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Filtering dropdowns */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Saring:</span>
                    </div>

                    {/* Filter Priority */}
                    <div className="flex items-center gap-1">
                      <span>Prioritas:</span>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as any)}
                        className="bg-black/40 border border-white/10 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-sans"
                      >
                        <option value="ALL">Semua</option>
                        <option value={Priority.HIGH}>Tinggi</option>
                        <option value={Priority.MEDIUM}>Sedang</option>
                        <option value={Priority.LOW}>Rendah</option>
                      </select>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1">
                      <span>Status:</span>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as any)}
                        className="bg-black/40 border border-white/10 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-sans"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value={TaskStatus.PENDING}>Pending</option>
                        <option value={TaskStatus.IN_PROGRESS}>In-Progress</option>
                        <option value={TaskStatus.COMPLETED}>Completed</option>
                        <option value={TaskStatus.VERIFIED}>Verified</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* TASK SUBMISSION FORM DIALOG (INLINE) */}
                {showAddForm && (
                  <form 
                    onSubmit={handleCreateTask}
                    className="bg-slate-900/80 border border-indigo-500/30 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        Formulir Pelaporan Kerusakan / Tugas GA Baru
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Judul Kendala / Pekerjaan</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: AC Bocor, Tumpahan Kopi, Kerusakan Lift"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Location */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Lokasi Spesifik</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Ruang Rapat Lt.3 Barat, Toilet Lobby Utama"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Reporter */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Nama Pelapor / Karyawan</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Budi Santoso (Admin HR)"
                          value={newReporter}
                          onChange={(e) => setNewReporter(e.target.value)}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Team Assignment */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Tim Penanggung Jawab</label>
                        <select
                          value={newTeam}
                          onChange={(e) => setNewTeam(e.target.value as Team)}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                        >
                          {Object.values(Team).map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                      </div>

                      {/* Priority */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Prioritas Penanganan</label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value as Priority)}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                        >
                          <option value={Priority.LOW}>LOW (Rendah)</option>
                          <option value={Priority.MEDIUM}>MEDIUM (Sedang)</option>
                          <option value={Priority.HIGH}>HIGH (Tinggi)</option>
                        </select>
                      </div>

                      {/* SLA Target */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-semibold uppercase">Target SLA (Selesaikan dalam ... Menit)</label>
                        <input
                          type="number"
                          required
                          min={15}
                          value={newSlaMinutes}
                          onChange={(e) => setNewSlaMinutes(Number(e.target.value))}
                          className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Deskripsi Detail Masalah / Penugasan</label>
                      <textarea
                        rows={2}
                        placeholder="Jelaskan secara terperinci apa yang rusak, gejala, atau instruksi pengerjaan..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-white/10 self-end mt-2"
                    >
                      Kirim & Sinkronkan Laporan
                    </button>
                  </form>
                )}

                {/* ACTIVE TASKS CONTAINER */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
                      <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs">Tidak ada tiket operasional yang cocok dengan kriteria saringan Anda.</p>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <div 
                        key={task.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all flex flex-col md:flex-row justify-between gap-4 shadow-sm"
                      >
                        {/* Task main info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider">
                              [{task.id}]
                            </span>
                            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                              {getTeamEmoji(task.team)} {task.team}
                            </span>
                            {getPriorityBadge(task.priority)}
                            {getStatusBadge(task.status)}
                          </div>

                          <h4 className="text-sm font-bold text-white mb-1">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                            {task.description}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-slate-400 border-t border-white/5 pt-2.5">
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase font-mono">LOKASI</span>
                              <span className="text-slate-300 font-semibold">{task.location}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase font-mono">PELAPOR KARYAWAN</span>
                              <span className="text-slate-300">{task.reporter}</span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[9px] text-slate-500 block uppercase font-mono">TARGET SLA</span>
                              <span className="font-mono text-indigo-300 font-bold">{task.slaMinutes} Menit</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Control Column */}
                        <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 min-w-[170px] shrink-0">
                          
                          {/* SLA & Time outcome displays */}
                          <div className="text-right w-full mb-3 md:mb-0">
                            {task.status === TaskStatus.VERIFIED && task.feedbackRating !== undefined && (
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-xs text-slate-400">Kepuasan:</span>
                                <div className="flex text-yellow-400">
                                  {Array.from({ length: task.feedbackRating }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {task.actualMinutes !== undefined && (
                              <div className="mt-1">
                                <p className="text-[10px] text-slate-500">
                                  Selesai dalam: <strong className="font-mono text-slate-300">{task.actualMinutes} menit</strong>
                                </p>
                                {task.actualMinutes <= task.slaMinutes ? (
                                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded inline-block font-bold">
                                    ✓ MEMENUHI SLA
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded inline-block font-bold">
                                    🚨 OVER SLA
                                  </span>
                                )}
                              </div>
                            )}

                            {task.status === TaskStatus.PENDING && (
                              <p className="text-[9px] text-slate-400 italic">
                                Belum direspons oleh staf lapangan.
                              </p>
                            )}
                          </div>

                          {/* State Transition buttons */}
                          <div className="w-full">
                            {task.status === TaskStatus.PENDING && (
                              <button
                                onClick={() => handleTransitionStatus(task.id, TaskStatus.IN_PROGRESS)}
                                className="w-full bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Mulai Kerja</span>
                              </button>
                            )}

                            {task.status === TaskStatus.IN_PROGRESS && (
                              <button
                                onClick={() => handleTransitionStatus(task.id, TaskStatus.COMPLETED)}
                                className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Tandai Selesai</span>
                              </button>
                            )}

                            {task.status === TaskStatus.COMPLETED && (
                              <div className="w-full space-y-1">
                                {verifyingTaskId === task.id ? (
                                  <div className="bg-black/50 p-2 rounded-lg border border-white/10 space-y-2">
                                    <p className="text-[10px] text-center text-slate-300">Pilih Rating CSAT:</p>
                                    <div className="flex justify-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setSelectedRating(star)}
                                          className={`hover:scale-110 transition-transform ${
                                            selectedRating >= star ? "text-yellow-400" : "text-slate-600"
                                          }`}
                                        >
                                          <Star className={`w-5 h-5 ${selectedRating >= star ? "fill-yellow-400" : ""}`} />
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => handleVerifyTask(task.id)}
                                      className="w-full bg-blue-600 text-white font-bold text-[10px] py-1 rounded hover:bg-blue-500 transition-colors"
                                    >
                                      Simpan & Verifikasi
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setVerifyingTaskId(task.id);
                                      setSelectedRating(5); // default
                                    }}
                                    className="w-full bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all animate-pulse"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Verifikasi Karyawan</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {task.status === TaskStatus.VERIFIED && (
                              <span className="w-full py-1 text-center text-slate-500 text-[11px] block border border-dashed border-white/10 rounded-lg">
                                Pekerjaan Selesai & Terverifikasi
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* COLUMN 3: AI RECOMENDATION & AUDIT LOGS */}
              <div className="flex flex-col gap-6">
                
                {/* A. AI OPERATIONAL ADVISOR WITH GEMINI */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-500/30 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight">AI Advisor (Google GAS)</h3>
                    </div>
                    <button
                      onClick={runAiAnalysis}
                      disabled={isAnalyzing}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>Analisis Tren</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    Otomatisasikan identifikasi <strong>bottleneck operasional</strong> dan usulan improvement dari rekam jejak log performa tim menggunakan kecerdasan Gemini.
                  </p>

                  {/* Analysis Result Box */}
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {isAnalyzing ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-400 italic">Gemini sedang menyisir data log tugas, metrik CSAT, dan mendeteksi titik macet...</p>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="text-xs">
                        {apiError && (
                          <div className="mb-3 p-2.5 bg-red-950/30 border border-red-500/20 rounded-lg text-red-400">
                            <strong>Status Key:</strong> {apiError}
                          </div>
                        )}
                        <MarkdownRenderer content={aiAnalysis} />
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500 text-xs italic">
                        Klik tombol &quot;Analisis Tren&quot; untuk mengagregasikan log aktivitas departemen dan menghasilkan wawasan perbaikan berbasis data secara real-time.
                      </div>
                    )}
                  </div>
                </div>

                {/* B. OPERATIONAL LEADERBOARD (REWARD CRITERIA) */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Award className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">GA Operational Leaderboard</h3>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Sistem insentif / Reward didasarkan pada pemenuhan target SLA tertinggi dan kepuasan CSAT dari karyawan pelapor.
                  </p>

                  <div className="space-y-3 mt-1">
                    {Object.values(Team).map((team, idx) => {
                      // Dynamically calculate metrics for preview
                      const teamTasks = tasks.filter(t => t.team === team);
                      const resolved = teamTasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VERIFIED);
                      const metSla = resolved.filter(t => t.actualMinutes && t.actualMinutes <= t.slaMinutes);
                      const compliance = resolved.length > 0 ? Math.round((metSla.length / resolved.length) * 100) : 85 + (idx * 3);
                      
                      const rated = teamTasks.filter(t => t.feedbackRating !== undefined);
                      const avgRating = rated.length > 0 
                        ? Number((rated.reduce((s, t) => s + (t.feedbackRating || 0), 0) / rated.length).toFixed(1))
                        : 4.6;

                      return (
                        <div key={team} className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                {getTeamEmoji(team)} {team}
                              </p>
                              <p className="text-[9px] text-slate-400">SLA Compliance: {compliance}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 justify-end">
                              <Star className="w-3 h-3 fill-yellow-400 inline" /> {avgRating}
                            </span>
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase mt-1 inline-block">
                              REWARD ELIGIBLE
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* C. REAL-TIME AUDIT TRAIL LOGS */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Live Audit Trail Logs</h3>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded animate-pulse">AUTOMATIC</span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {logs.map((log) => (
                      <div key={log.id} className="text-[11px] border-b border-white/5 pb-2 last:border-0">
                        <div className="flex justify-between text-slate-400 mb-0.5 font-mono">
                          <span className="text-indigo-400 font-bold">{log.actor}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString("id-ID", { hour12: false })}</span>
                        </div>
                        <p className="text-white font-medium mb-0.5">
                          {log.action} <span className="text-slate-500 font-mono">({log.taskId})</span>
                        </p>
                        {log.details && (
                          <p className="text-slate-400 italic text-[10px] leading-relaxed">
                            {log.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

      </main>

      {/* Status Bar Footer */}
      <footer className="relative z-10 h-10 bg-black/50 border-t border-white/10 px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 py-2 sm:py-0">
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

    </div>
  );
}
