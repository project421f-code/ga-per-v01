import React, { useState } from "react";
import { Team, StakeholderSurvey } from "../types";
import { Star, CheckCircle, Plus, Sparkles, MessageSquare, Shield, Wrench, Home, UserCheck, Calendar, Boxes } from "lucide-react";

interface StakeholderSurveysViewProps {
  surveys: StakeholderSurvey[];
  onAddSurvey: (survey: StakeholderSurvey) => void;
}

export default function StakeholderSurveysView({ surveys, onAddSurvey }: StakeholderSurveysViewProps) {
  // Form State
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [month, setMonth] = useState("Juli 2026");
  
  const [ratings, setRatings] = useState<Record<Team, number>>({
    [Team.MAINTENANCE]: 5,
    [Team.HOUSEKEEPING]: 5,
    [Team.SECURITY]: 5,
    [Team.CLEANING_SERVICE]: 5,
    [Team.ASSET_INVENTORY]: 5,
  });

  const [feedbacks, setFeedbacks] = useState<Record<Team, string>>({
    [Team.MAINTENANCE]: "",
    [Team.HOUSEKEEPING]: "",
    [Team.SECURITY]: "",
    [Team.CLEANING_SERVICE]: "",
    [Team.ASSET_INVENTORY]: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getTeamIcon = (team: Team) => {
    switch (team) {
      case Team.MAINTENANCE:
        return <Wrench className="w-4 h-4 text-indigo-400" />;
      case Team.HOUSEKEEPING:
        return <Home className="w-4 h-4 text-emerald-400" />;
      case Team.SECURITY:
        return <Shield className="w-4 h-4 text-blue-400" />;
      case Team.CLEANING_SERVICE:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case Team.ASSET_INVENTORY:
        return <Boxes className="w-4 h-4 text-amber-400" />;
    }
  };

  const getRatingDescription = (score: number) => {
    switch (score) {
      case 1: return "Sangat Kurang 😠";
      case 2: return "Kurang 😟";
      case 3: return "Cukup 🙂";
      case 4: return "Baik 😊";
      case 5: return "Sangat Baik 😍";
      default: return "";
    }
  };

  const handleRatingChange = (team: Team, value: number) => {
    setRatings(prev => ({ ...prev, [team]: value }));
  };

  const handleFeedbackChange = (team: Team, text: string) => {
    setFeedbacks(prev => ({ ...prev, [team]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama Stakeholder wajib diisi.");
      return;
    }
    if (!department.trim()) {
      setFormError("Divisi / Jabatan wajib diisi.");
      return;
    }

    // Validation: Require feedback if rating < 4
    for (const team of Object.values(Team)) {
      if (ratings[team] < 4 && !feedbacks[team].trim()) {
        setFormError(`Mohon tuliskan feedback korektif untuk tim ${team} karena Anda memberikan rating di bawah 4.`);
        return;
      }
    }

    const newSurvey: StakeholderSurvey = {
      id: `SRV-${Date.now()}`,
      month,
      stakeholderName: name,
      department,
      ratings: { ...ratings },
      feedback: { ...feedbacks },
      submittedAt: new Date().toISOString(),
    };

    onAddSurvey(newSurvey);
    
    // Show success & reset
    setShowSuccess(true);
    setName("");
    setDepartment("");
    setRatings({
      [Team.MAINTENANCE]: 5,
      [Team.HOUSEKEEPING]: 5,
      [Team.SECURITY]: 5,
      [Team.CLEANING_SERVICE]: 5,
      [Team.ASSET_INVENTORY]: 5,
    });
    setFeedbacks({
      [Team.MAINTENANCE]: "",
      [Team.HOUSEKEEPING]: "",
      [Team.SECURITY]: "",
      [Team.CLEANING_SERVICE]: "",
      [Team.ASSET_INVENTORY]: "",
    });

    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Preview avg
  const calculatedAvg = (
    (ratings[Team.MAINTENANCE] + ratings[Team.HOUSEKEEPING] + ratings[Team.SECURITY] + ratings[Team.CLEANING_SERVICE] + ratings[Team.ASSET_INVENTORY]) / 5
  ).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUMN 1 & 2: SURVEY FORM */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Form Survey Kepuasan Stakeholder Bulanan</h2>
              <p className="text-xs text-slate-400">Berikan penilaian langsung terhadap kualitas layanan harian semua tim GA</p>
            </div>
          </div>

          {showSuccess && (
            <div className="mb-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">Terima kasih atas partisipasi Anda!</p>
                <p className="text-[10px] text-emerald-400/80">Survey berhasil tersimpan ke Google Sheets & diintegrasikan ke nilai KPI secara real-time.</p>
              </div>
            </div>
          )}

          {formError && (
            <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl text-xs font-semibold animate-pulse">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stakeholder Identity Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Bulan Evaluasi</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-2.5" />
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Juli 2026">Juli 2026 (Bulan Ini)</option>
                    <option value="Juni 2026">Juni 2026</option>
                    <option value="Mei 2026">Mei 2026</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Nama Stakeholder</label>
                <input
                  type="text"
                  placeholder="Contoh: Bapak Hermawan, M.T."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Divisi / Jabatan</label>
                <input
                  type="text"
                  placeholder="Contoh: HR Director, Operational Head"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Department-wise Ratings */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest border-b border-white/5 pb-1">Penilaian per Departemen GA</h3>
              
              {Object.values(Team).map((team) => (
                <div 
                  key={team}
                  className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 hover:border-white/10 transition-all"
                >
                  {/* Left info */}
                  <div className="md:w-1/3 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                        {getTeamIcon(team)}
                      </div>
                      <span className="text-xs font-bold text-white">{team}</span>
                    </div>
                    
                    <div className="mt-2 text-indigo-400 font-bold text-xs font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block w-fit">
                      {getRatingDescription(ratings[team])}
                    </div>
                  </div>

                  {/* Rating Selector & Feedback text */}
                  <div className="flex-1 space-y-3">
                    {/* Stars Select */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Beri Skor:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(team, star)}
                            className="hover:scale-110 transition-all duration-150"
                          >
                            <Star 
                              className={`w-5.5 h-5.5 ${
                                ratings[team] >= star 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-slate-600"
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback comment field */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Feedback / Kritik & Saran</label>
                        {ratings[team] < 4 && (
                          <span className="text-[8px] text-red-400 bg-red-950/40 border border-red-500/20 px-1.5 py-0.2 rounded font-bold uppercase animate-pulse">
                            Kritik korektif Wajib diisi!
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={
                          ratings[team] < 4 
                            ? "Sebutkan kekurangan atau bagian spesifik yang perlu diperbaiki..." 
                            : "Ulasan kepuasan pelayanan (opsional)..."
                        }
                        value={feedbacks[team]}
                        onChange={(e) => handleFeedbackChange(team, e.target.value)}
                        className={`w-full bg-black/40 border text-slate-200 text-xs rounded-lg px-3 py-1.8 focus:outline-none focus:border-indigo-500 font-sans ${
                          ratings[team] < 4 && !feedbacks[team].trim() 
                            ? "border-red-500/40 focus:border-red-500" 
                            : "border-white/10"
                        }`}
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Preview and Submit Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-indigo-950/30 to-blue-950/30 border border-indigo-500/20 p-4 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Rata-rata Skor Survey Ini: <span className="text-indigo-300 font-mono text-sm">{calculatedAvg} / 5.00</span>
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Skor kepuasan stakeholder memiliki bobot <strong>40%</strong> terhadap nilai KPI bulanan GA.
                </p>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-bold text-xs py-2 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] border border-white/10 shrink-0"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Kirim Survey Stakeholder</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* COLUMN 3: SUBMITTED HISTORY & FEEDBACKS */}
      <div className="flex flex-col gap-6">
        
        {/* Metodologi Info Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-500/20 p-5 rounded-2xl backdrop-blur-md shadow-sm">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Integrasi Metrik KPI
          </h3>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Sistem KPI GA menggabungkan dua dimensi penting untuk mewujudkan transparansi:
          </p>
          <ul className="space-y-2 text-[10px] text-slate-400">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">60%</span>
              <span><strong>Metrik Operasional (SLA)</strong>: Tingkat penyelesaian harian tepat waktu sesuai standar limitasi waktu yang tersimpan di Google Sheet.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-indigo-400 font-bold shrink-0">40%</span>
              <span><strong>Metrik Kepuasan (Stakeholder)</strong>: Diambil langsung dari survey bulanan yang Anda isi melalui halaman ini.</span>
            </li>
          </ul>
        </div>

        {/* Historic Responses list */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Riwayat Survey Masuk</h3>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-bold uppercase">
              {surveys.length} survey
            </span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {surveys.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">Belum ada riwayat survey yang terisi.</p>
            ) : (
              surveys.map((srv) => {
                const ratingsValues = Object.values(srv.ratings).map(Number);
                const srvAvg = ratingsValues.length > 0
                  ? (ratingsValues.reduce((sum, r) => sum + r, 0) / ratingsValues.length).toFixed(1)
                  : "5.0";

                return (
                  <div key={srv.id} className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white">{srv.stakeholderName}</h4>
                        <p className="text-[9px] text-slate-400">{srv.department} • <span className="text-indigo-400 font-bold">{srv.month}</span></p>
                      </div>
                      <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        ★ {srvAvg}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2.5 space-y-2">
                      {Object.values(Team).map((team) => (
                        <div key={team} className="space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-300 font-medium flex items-center gap-1.5">
                              {getTeamIcon(team)} {team}
                            </span>
                            <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                              ★ {srv.ratings[team]}
                            </span>
                          </div>
                          {srv.feedback[team] ? (
                            <p className="text-[9px] text-slate-400 italic bg-white/5 p-1.5 rounded border border-white/5 leading-relaxed">
                              &ldquo;{srv.feedback[team]}&rdquo;
                            </p>
                          ) : (
                            <p className="text-[8px] text-slate-500 italic px-1.5">Tidak ada komentar spesifik</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-right text-[8px] text-slate-500 font-mono">
                      Diterima: {new Date(srv.submittedAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
