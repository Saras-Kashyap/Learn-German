"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Calendar,
  Trophy,
  Activity,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = () => {
      setLoading(true);
      try {
        const local = localStorage.getItem("b2_exam_progress");
        if (local) {
          setProgress(JSON.parse(local));
        }
      } catch (err) {
        console.error("Local storage error:", err);
      }
      setLoading(false);
    };
    initData();
  }, []);

  const getAverageScore = () => {
    if (!progress) return null;
    const scores = [
      progress.lesen_score,
      progress.hoeren_score,
      progress.schreiben_score,
      progress.sprechen_score
    ].filter((s) => s !== null && s !== undefined);
    
    if (scores.length === 0) return null;
    const total = scores.reduce((sum, s) => sum + s, 0);
    return Math.round((total / (scores.length * 60)) * 100);
  };

  const avgPercent = getAverageScore();


  const sections = [
    {
      title: "Lesen",
      subtitle: "Reading Comprehension",
      duration: "75 Min.",
      description: "Analyze complex B2 articles, associate viewpoints, and solve multiple-choice reading tasks.",
      icon: BookOpen,
      href: "/lesen",
      color: "from-blue-500 to-indigo-600",
      lightColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      tag: "5 Modules"
    },
    {
      title: "Hören",
      subtitle: "Listening Comprehension",
      duration: "40 Min.",
      description: "Understand radio reports, academic lectures, and casual dialogues with audio & transcript support.",
      icon: Headphones,
      href: "/hoeren",
      color: "from-emerald-400 to-teal-600",
      lightColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      tag: "4 Modules"
    },
    {
      title: "Schreiben",
      subtitle: "Written Expression",
      duration: "75 Min.",
      description: "Draft formal emails or forum posts and receive instant grammatical and vocabulary corrections from our AI.",
      icon: PenTool,
      href: "/schreiben",
      color: "from-amber-400 to-orange-600",
      lightColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      tag: "2 Tasks"
    },
    {
      title: "Sprechen",
      subtitle: "Oral Expression",
      duration: "15 Min.",
      description: "Deliver presentations, pitch suggestions, and carry out examiner debate rounds in our speaking recorder.",
      icon: Mic,
      href: "/sprechen",
      color: "from-rose-500 to-pink-600",
      lightColor: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      tag: "2 Parts"
    }
  ];

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 md:py-12 md:px-12 shadow-xl shadow-slate-900/10 dark:bg-slate-950 dark:border dark:border-slate-800">
        {/* Subtle German Flag Stripe Pattern */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-amber-500" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Award className="h-3.5 w-3.5" /> Goethe-Zertifikat B2 & ÖSD Preparation
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Master your B2 German Level
          </h1>
          <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
            Welcome to the interactive exam preparation platform. Train all four language competencies of the B2 exam with realistic exercises, live audio, and smart AI evaluations.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
              Start Practice Test
            </button>
            <button className="rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-2.5 text-xs md:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all">
              View Exam Structure
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden md:block bg-gradient-to-l from-indigo-500 to-transparent pointer-events-none" />
      </div>

      {/* Grid: Overview and Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Stat Card 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Daily Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">5 Days</span>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +1 today
              </span>
            </div>
            <p className="text-xs text-slate-500">Practice daily for peak performance!</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <Trophy className="h-6 w-6" />
          </div>
        </div>        {/* Stat Card 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {avgPercent !== null ? `${avgPercent} %` : "-- %"}
              </span>
              <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                B2 Level
              </span>
            </div>
            <p className="text-xs text-slate-500">A minimum of 60% is required to pass the exam.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Next Exam Date
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">June 24, 2026</span>
            </div>
            <p className="text-xs text-slate-500">12 days remaining for preparation.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Section Navigation */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span>Practice Exam Modules</span>
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Please select a module)</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const key = `${section.title.toLowerCase()}_score`;
            const scoreVal = progress ? progress[key] : null;
            const scorePercent = scoreVal !== null && scoreVal !== undefined ? Math.round((scoreVal / 60) * 100) : null;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${section.lightColor}`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                      {section.duration}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center">
                      <span className="inline-block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        {section.subtitle}
                      </span>
                      {scoreVal !== null && scoreVal !== undefined && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                          {scorePercent}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-0.5">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                    {section.tag}
                  </span>
                  {scoreVal !== null && scoreVal !== undefined ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Score: {scoreVal}/60
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Not started
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Helpful B2 Quick Links or Tips */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">5 Golden B2 Exam Tips</h3>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-350">
          <li className="flex gap-2">
            <span className="text-indigo-500 font-bold">1.</span>
            <span><strong>Expand Vocabulary:</strong> Use noun-verb connections (Nomen-Verb-Verbindungen, e.g., „zur Verfügung stehen“, „in Kauf nehmen“) for better writing and speaking scores.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500 font-bold">2.</span>
            <span><strong>Use Connectors:</strong> Connect sentences logically using two-part connectors (zweiteilige Konnektoren) like „nicht nur... sondern auch“ or „sowohl... als auch“.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500 font-bold">3.</span>
            <span><strong>Structured Argumentation:</strong> In the writing and speaking parts, state your opinion clearly, weigh the pros and cons, and provide concrete examples.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500 font-bold">4.</span>
            <span><strong>Time Management:</strong> The reading section is long. Don't waste time on single unknown words; focus on capturing the overall context.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-indigo-500 font-bold">5.</span>
            <span><strong>Active Listening:</strong> Pay attention to keywords. Often, the questions will use synonyms of the words actually spoken in the audio.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
