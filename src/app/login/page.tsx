"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, LogIn, ArrowRight, UserPlus, Globe } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        
        if (data.user && data.session === null) {
          setMessage({
            type: "success",
            text: "Registration successful! Please check your email for confirmation.",
          });
        } else {
          setMessage({
            type: "success",
            text: "Successfully registered and signed in!",
          });
          router.push("/");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Successfully logged in! Redirecting...",
        });
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
        {/* Flag accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-amber-500" />
        </div>

        {/* Logo */}
        <div className="text-center space-y-2 mb-8 mt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-505 text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
            B2
          </div>
          <h2 className="text-xl font-extrabold text-slate-855 dark:text-slate-100">
            DeutschB2 Exam Prep
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sign in to secure your learning progress in Supabase.
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`rounded-2xl p-4 text-xs font-semibold mb-6 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-400"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/35 dark:text-rose-455"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-xl border border-slate-205 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-555 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs md:text-sm rounded-xl border border-slate-205 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / In */}
        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:underline font-semibold dark:text-indigo-400"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Guest Mode */}
        <button
          onClick={handleGuestLogin}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-655 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm"
        >
          <span>Continue as Guest</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

      </div>
    </div>
  );
}
