"use client";

import { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { useAtlasStore, type UserProfile } from "@/lib/store";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    setUser,
    pendingBookingHotel,
    setPendingBookingHotel,
    setBookingHotel,
  } = useAtlasStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  function handleClose() {
    setError(null);
    setAuthModalOpen(false);
  }

  function handleCompleteAuth(profile: UserProfile) {
    setUser(profile);
    setAuthModalOpen(false);

    // If user was in the middle of booking a hotel, automatically open the booking drawer
    if (pendingBookingHotel) {
      setBookingHotel(pendingBookingHotel);
      setPendingBookingHotel(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 4) {
      setError("Please enter a password with at least 4 characters.");
      return;
    }

    let fullName = name.trim();
    if (mode === "signin" && !fullName) {
      fullName = email.split("@")[0].replace(/[._]/g, " ");
      fullName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
    }

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "Traveler";

    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone: phone.trim() || "+1 555 0192",
    };

    handleCompleteAuth(profile);
  }

  function handleQuickDemoLogin(demoName: string, demoEmail: string) {
    const [firstName, ...rest] = demoName.split(" ");
    const profile: UserProfile = {
      id: `usr_demo_${Date.now()}`,
      name: demoName,
      firstName: firstName || "Elena",
      lastName: rest.join(" ") || "Rostova",
      email: demoEmail,
      phone: "+1 555 0192",
    };
    handleCompleteAuth(profile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-atlas-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

        {/* Header */}
        <div className="p-6 border-b border-white/8 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shadow-lg shadow-violet-900/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {mode === "signin" ? "Sign In to Atlas AI" : "Create Traveler Account"}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Authentication required before booking stays
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/90 border border-white/5 text-xs font-semibold">
            <button
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="elena.rostova@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+1 555 0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{mode === "signin" ? "Sign In & Continue" : "Create Account & Continue"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* One-click Demo Travelers */}
        <div className="px-6 pb-6 pt-1 border-t border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block text-center">
            Or quick sign in as demo traveler:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("Elena Rostova", "elena.rostova@example.com")}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[11px] font-medium text-zinc-300 hover:text-white transition-all text-left flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                ER
              </div>
              <span className="truncate">Elena Rostova</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("Alex Morgan", "alex.morgan@example.com")}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[11px] font-medium text-zinc-300 hover:text-white transition-all text-left flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                AM
              </div>
              <span className="truncate">Alex Morgan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
