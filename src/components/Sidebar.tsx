"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  LayoutDashboard,
  Menu,
  X,
  Trophy,
  Globe,
  BookMarked,
  Sun,
  Moon
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lesen", label: "Lesen (Reading)", icon: BookOpen },
  { href: "/hoeren", label: "Hören (Listening)", icon: Headphones },
  { href: "/schreiben", label: "Schreiben (Writing)", icon: PenTool },
  { href: "/sprechen", label: "Sprechen (Speaking)", icon: Mic },
  { href: "/vokabeln", label: "Vokabeln (SRS)", icon: BookMarked }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scoreInfo, setScoreInfo] = useState({ progress: 64, xp: 1240 });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Determine initial theme on mount
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    }
  };

  const updateProgressInfo = () => {
    // Load progress from LocalStorage
    try {
      const local = localStorage.getItem("b2_exam_progress");
      if (local) {
        const localProgress = JSON.parse(local);
        const totalPoints = 
          (localProgress.lesen_score || 0) + 
          (localProgress.hoeren_score || 0) + 
          (localProgress.schreiben_score || 0) + 
          (localProgress.sprechen_score || 0);
        
        const percentage = Math.min(Math.round((totalPoints / 240) * 100) + 50, 100);
        setScoreInfo({
          progress: percentage,
          xp: totalPoints * 10
        });
      } else {
        // Default progress
        setScoreInfo({ progress: 50, xp: 0 });
      }
    } catch (err) {
      console.error("Failed to load progress from localStorage:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    updateProgressInfo();

    // Dynamic updates for localStorage changes
    const interval = setInterval(() => {
      updateProgressInfo();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-950">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-md">
            B2
          </div>
          <span className="font-bold tracking-tight text-slate-800 dark:text-slate-100">
            DeutschB2 <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ml-1">Exam Prep</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-900"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen dark:border-slate-800 dark:bg-slate-950 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="hidden h-20 items-center border-b border-slate-200 px-6 md:flex dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              B2
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                DeutschB2
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                Practice Mode
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Sections
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card / Info Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/10 space-y-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                Practice Profile
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <Globe className="h-3 w-3" /> Local Storage
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
            <span>Progress: {scoreInfo.progress}%</span>
            <div className="flex items-center gap-0.5">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span className="font-semibold text-slate-600 dark:text-slate-350">{scoreInfo.xp} XP</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${scoreInfo.progress}%` }}
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
