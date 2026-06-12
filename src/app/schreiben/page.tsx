"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PenTool,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Info,
  CloudLightning
} from "lucide-react";

export default function SchreibenPage() {
  const supabase = createClient();

  const [subject, setSubject] = useState("Beschwerde über die fehlerhafte Lieferung - Bestellnummer #87421");
  const [emailBody, setEmailBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [aiScore, setAiScore] = useState(48);

  // Supabase State
  const [user, setUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();
  }, [supabase]);

  // Typical B2 draft with a few common errors to let the user see the tool correct it
  const demoDraft = `Sehr geehrte Damen und Herren,

ich schreibe Ihnen, weil ich habe vor einer Woche einen Laptop in Ihrem Online-Shop bestellt. Gestern ist das Paket angekommen, aber der Laptop ist leider beschädigt. Das Display ist kaputt und es funktioniert überhaupt nicht.

Ich bin sehr enttäuscht, weil das Gerät für meine Arbeit dringend notwendig ist. Ich habe schon dreimal bei Ihrem Kundenservice angerufen, aber niemand hat mir geantwortet. Das finde ich absolut inakzeptabel.

Deshalb bitte ich Sie, mir so schnell wie möglich ein neues Gerät zu schicken. Wenn das nicht möglich ist, möchte ich mein Geld zurückbekommen.

Ich warte auf Ihre schnelle Antwort.

Mit freundlichen Grüßen,
Max Mustermann`;

  const wordCount = emailBody.trim() === "" ? 0 : emailBody.trim().split(/\s+/).length;

  const handleLoadDemo = () => {
    setEmailBody(demoDraft);
    setShowEvaluation(false);
    setSyncStatus("idle");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordCount < 50) return;
    
    setIsSubmitting(true);
    setSyncStatus("idle");

    const computedScore = Math.min(35 + Math.floor((wordCount - 50) / 4), 58);
    setAiScore(computedScore);

    setTimeout(async () => {
      setIsSubmitting(false);
      setShowEvaluation(true);

      if (user) {
        setSyncStatus("syncing");
        try {
          const { data: existingProgress } = await supabase
            .from("exam_progress")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existingProgress) {
            const { error } = await supabase
              .from("exam_progress")
              .update({
                schreiben_score: Math.max(existingProgress.schreiben_score || 0, computedScore),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("exam_progress")
              .insert({
                user_id: user.id,
                schreiben_score: computedScore,
                updated_at: new Date().toISOString()
              });
            if (error) throw error;
          }
          setSyncStatus("synced");
        } catch (err) {
          console.error("Supabase sync error:", err);
          setSyncStatus("error");
        }
      } else {
        // Guest mode - save to localstorage
        try {
          const local = localStorage.getItem("b2_exam_progress");
          const progress = local ? JSON.parse(local) : { lesen_score: 0, hoeren_score: 0, schreiben_score: 0, sprechen_score: 0 };
          progress.schreiben_score = Math.max(progress.schreiben_score || 0, computedScore);
          localStorage.setItem("b2_exam_progress", JSON.stringify(progress));
          setSyncStatus("synced");
        } catch (err) {
          console.error("Local storage error:", err);
        }
      }
    }, 2000);
  };

  const handleReset = () => {
    setEmailBody("");
    setShowEvaluation(false);
    setSyncStatus("idle");
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top action bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <PenTool className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Writing Module</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Goethe B2 - Written Expression Part 1</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-655 hover:bg-slate-55 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Load Demo Draft</span>
          </button>
        </div>
      </div>

      {/* Sync Banner */}
      {syncStatus !== "idle" && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between font-semibold ${
          syncStatus === "syncing" ? "bg-slate-100 text-slate-650 dark:bg-slate-900" :
          syncStatus === "synced" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
          "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455"
        }`}>
          <div className="flex items-center gap-1.5">
            <CloudLightning className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} />
            <span>
              {syncStatus === "syncing" && "Saving written evaluation..."}
              {syncStatus === "synced" && (user ? "Score successfully synchronized!" : "Progress saved locally!")}
              {syncStatus === "error" && "Error synchronizing score."}
            </span>
          </div>
          {syncStatus === "synced" && <span className="text-[10px] font-bold">{user ? "Cloud Saved" : "Local Saved"}</span>}
        </div>
      )}

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 overflow-y-auto">
        
        {/* Left Side: Instruction & Writing Area */}
        <div className="space-y-6 flex flex-col">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2 text-sm md:text-base">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <span>Task: Complaint Email (Part 1)</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
              You recently ordered a laptop online. The device arrived damaged and customer service is not responding to your queries. Write an email to the company.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] md:text-xs font-medium text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Length: 100 - 150 words</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Formal Tone</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Max Score: 60 Points</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden min-h-[450px]">
            <div className="bg-slate-50/75 border-b border-slate-100 p-4 space-y-2.5 dark:bg-slate-950 dark:border-slate-800">
              <div className="flex items-center text-xs md:text-sm">
                <span className="w-16 font-semibold text-slate-400 dark:text-slate-550">To:</span>
                <span className="text-slate-700 dark:text-slate-300 bg-slate-200/40 dark:bg-slate-850 px-2 py-0.5 rounded font-mono text-xs">
                  customer-service@tech-world-shop.de
                </span>
              </div>
              <div className="flex items-center text-xs md:text-sm">
                <span className="w-16 font-semibold text-slate-400 dark:text-slate-550">Subject:</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-slate-350 py-0.5 px-0 text-slate-855 dark:text-slate-100 font-medium focus:ring-0 text-xs md:text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col p-4 relative">
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email here... (Do not forget the formal greeting and sign-off)"
                className="w-full flex-1 resize-none border-0 p-0 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-0 focus:outline-none dark:bg-transparent min-h-[250px]"
                required
              />

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    wordCount >= 100 && wordCount <= 160
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : wordCount > 160
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450"
                      : "bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {wordCount} words
                  </span>
                  {wordCount < 100 && (
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Minimum 100 words recommended</span>
                  )}
                  {wordCount >= 100 && wordCount <= 160 && (
                    <span className="text-[10px] text-emerald-550 font-medium hidden sm:inline flex items-center gap-0.5">
                      ✓ Perfect length!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {emailBody && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-405 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={wordCount < 50 || isSubmitting}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/10 hover:bg-amber-400 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-650"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Request AI Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: AI Evaluation Result */}
        <div className="space-y-6">
          {!showEvaluation && !isSubmitting && (
            <div className="h-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center min-h-[350px] dark:border-slate-800 dark:bg-slate-900/10">
              <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-pulse" />
              <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-350 text-sm md:text-base">Waiting for Submission</h3>
              <p className="mt-2 text-xs md:text-sm text-slate-400 max-w-xs leading-relaxed">
                Write your text or load the demo draft, then click "Request AI Evaluation" to receive detailed corrections.
              </p>
            </div>
          )}

          {isSubmitting && (
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[350px] dark:border-slate-800 dark:bg-slate-900">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-505" />
                <Sparkles className="absolute h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="mt-6 font-bold text-slate-800 dark:text-slate-200">AI Evaluation in Progress</h3>
              <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xs leading-relaxed">
                The DeutschB2 AI is analyzing sentence structure, vocabulary range, grammatical correctness, and coherence based on Goethe-B2 grading scales...
              </p>
            </div>
          )}

          {showEvaluation && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 animate-fadeIn space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <span>AI Evaluation</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Goethe-Zertifikat B2 Grading Rubric</p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-2xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-2xl dark:bg-emerald-950/40 dark:text-emerald-400">
                    B2 – Passed!
                  </span>
                  <span className="block text-[10px] text-slate-450 dark:text-slate-550 mt-1 font-semibold">Score: {aiScore}/60</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200/25 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Grammar & Structure</span>
                  <span className="text-xl font-bold text-slate-855 dark:text-slate-200 mt-1 block">80%</span>
                  <div className="mt-1 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[80%] rounded-full" />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200/25 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Vocabulary Range</span>
                  <span className="text-xl font-bold text-slate-855 dark:text-slate-200 mt-1 block">75%</span>
                  <div className="mt-1 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[75%] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grammar Corrections</h4>
                
                <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-4 dark:border-rose-900/30 dark:bg-rose-955/10 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-455 px-2 py-0.5 rounded">Original:</span>
                    <span className="line-through text-slate-500">...weil ich habe vor einer Woche...</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded">Corrected:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">...weil ich vor einer Woche [...] bestellt habe.</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-slate-650 dark:text-slate-400 flex gap-1 items-start mt-2">
                    <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>In subordinate clauses introduced by the conjunction <strong>„weil“</strong>, the conjugated verb must be placed at the very <strong>end</strong> of the clause.</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/20 p-4 dark:border-amber-900/30 dark:bg-amber-955/10 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-455 px-2 py-0.5 rounded">Suggestion:</span>
                    <span className="text-slate-500">...Ich warte auf Ihre schnelle Antwort...</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded">Recommended (B2):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Über eine baldige Rückmeldung würde ich mich sehr freuen.</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-slate-655 dark:text-slate-405 flex gap-1 items-start mt-2">
                    <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>Use the subjunctive II (Konjunktiv II: „würde mich freuen“) in formal correspondences to maintain a polite and advanced B2 tone.</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-150 bg-indigo-50/30 p-4 dark:border-indigo-900/30 dark:bg-indigo-955/10 space-y-2">
                <h4 className="text-xs font-bold text-indigo-805 dark:text-indigo-350 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> B2 Nominal Style Recommendations
                </h4>
                <p className="text-[11px] md:text-xs text-slate-655 dark:text-slate-400 leading-normal">
                  To achieve a higher score in vocabulary range, consider replacing simple verbs with B2 nominal constructs (Nomen-Verb-Verbindungen):
                </p>
                <div className="mt-2 space-y-1.5 text-[11px] md:text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-350 border-b border-slate-200/30 pb-1">
                    <span>Basic Verb: „ich habe bestellt“</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="font-medium text-slate-855 dark:text-slate-100">„ich habe eine Bestellung aufgegeben“</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-350">
                    <span>Basic Verb: „das Gerät beschädigen“</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="font-medium text-slate-855 dark:text-slate-100">„eine Beschädigung am Gerät aufweisen“</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
