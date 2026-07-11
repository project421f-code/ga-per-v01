import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Award, Mail, Lock, Chrome, LogIn, UserPlus, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const { login, loginWithGoogle, register, isConfigured, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setSubmitting(true);

    try {
      let errMsg: string | null = null;
      if (mode === "login") {
        errMsg = await login(email, password);
      } else {
        errMsg = await register(email, password);
        if (!errMsg) {
          setSuccessMsg("Akun berhasil dibuat! Anda akan dialihkan...");
          // Setelah register berhasil, user otomatis login
          setTimeout(() => setSuccessMsg(null), 3000);
          setMode("login");
          setSubmitting(false);
          return;
        }
      }

      if (errMsg) {
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const errMsg = await loginWithGoogle();
      if (errMsg) setError(errMsg);
    } catch (err: any) {
      setError(err.message || "Google login gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConfigured && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Firebase Belum Dikonfigurasi</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Untuk mengaktifkan autentikasi, Anda perlu mengisi konfigurasi Firebase di file <code className="bg-slate-800 text-indigo-300 px-1 rounded">.env</code>.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-left text-[11px] font-mono text-slate-400">
            <p className="mb-1">Salin ini ke <strong className="text-white">.env</strong>:</p>
            VITE_FIREBASE_API_KEY=your_key<br />
            VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com<br />
            VITE_FIREBASE_PROJECT_ID=your_project_id<br />
            VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com<br />
            VITE_FIREBASE_MESSAGING_SENDER_ID=your_id<br />
            VITE_FIREBASE_APP_ID=your_app_id<br />
            VITE_GAS_WEBAPP_URL=https://script.google.com/macros/s/your_id/exec
          </div>
          <p className="text-xs text-slate-500">
            Sementara, aplikasi akan berjalan dalam mode <strong className="text-emerald-400">Demo (Mock Data)</strong> tanpa login.
          </p>
          <a
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Lanjut ke Demo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Brand */}
      <div className="relative z-10 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-500 to-emerald-400 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          GA Performance Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Sistem Digitalisasi Operasional General Affair
        </p>
      </div>

      {/* Login / Register Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        {/* Tab toggle */}
        <div className="flex bg-black/30 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
            Masuk
          </button>
          <button
            onClick={() => { setMode("register"); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
            Daftar
          </button>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="contoh@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Masuk dengan Email
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Buat Akun Baru
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-slate-500 font-bold uppercase">Atau</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full bg-white/5 hover:bg-white/10 disabled:bg-slate-800/50 border border-white/10 text-white font-semibold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5 text-blue-400" />
          {mode === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}
        </button>

        {/* Footer info */}
        <p className="mt-6 text-[10px] text-slate-500 text-center leading-relaxed">
          Data autentikasi dikelola oleh <strong className="text-slate-400">Firebase Authentication</strong>.
          Aplikasi ini tidak menyimpan password Anda.
        </p>
      </div>

      {/* Demo mode link */}
      <div className="relative z-10 mt-6">
        <a
          href="/?demo=1"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Lanjutkan sebagai <strong>Demo (Mock Data)</strong>
        </a>
      </div>
    </div>
  );
}
