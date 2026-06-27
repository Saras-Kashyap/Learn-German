"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Play,
  CheckCircle2,
  ChevronRight,
  CloudLightning
} from "lucide-react";

// Mock AI Examiner Responses for the Debate Simulation
const examinerDebateFlow = [
  {
    step: 0,
    examinerText: "Hallo! Willkommen beim Modul Sprechen. Lassen Sie uns das Thema debattieren: 'Sollen gedruckte Bücher durch E-Books vollständig ersetzt werden?' Ich vertrete die Position, dass gedruckte Bücher eine Seele haben und für das haptische Leseerlebnis unverzichtbar sind. Was ist Ihre Meinung dazu?",
    userOptions: [
      {
        text: "Ich verstehe Ihren Standpunkt, aber ich denke, dass E-Books viel praktischer sind. Man kann Hunderte von Büchern auf einem kleinen Gerät speichern.",
        speechTemplate: "Einerseits verstehe ich Ihren Standpunkt bezüglich des Lesegefühls, andererseits lässt sich nicht leugnen, dass E-Books einen enormen praktischen Vorteil bieten..."
      },
      {
        text: "Das sehe ich ganz anders. Gedruckte Bücher beanspruchen zu viel Platz und die Herstellung schadet der Umwelt durch Papierverschwendung.",
        speechTemplate: "Ich bin da völlig anderer Ansicht. Angesichts des Klimawandels sollten wir die Papierverschwendung durch gedruckte Bücher kritisch hinterfragen..."
      }
    ]
  },
  {
    step: 1,
    examinerText: "Ein interessanter Punkt. Doch E-Reader benötigen Strom und seltene Erze für die Akku-Herstellung. Das ist auch nicht gerade umweltfreundlich. Zudem ermüden die Augen beim Lesen auf Bildschirmen viel schneller als auf Papier. Wie sehen Sie das?",
    userOptions: [
      {
        text: "Moderne E-Reader nutzen E-Ink-Technologie, die die Augen schont. Außerdem liest man ein Gerät über Jahre hinweg, wodurch sich die Ökobilanz verbessert.",
        speechTemplate: "Dem möchte ich hinzufügen, dass die E-Ink-Technologie dem echten Papier sehr nahekommt. Darüber hinaus amortisiert sich die Ökobilanz bei langfristiger Nutzung..."
      },
      {
        text: "Das mag stimmen, aber die Barrierefreiheit von E-Books ist ein großer Vorteil. Man kann Schriftgrößen anpassen, was vor allem älteren Menschen hilft.",
        speechTemplate: "Obwohl Sie Recht haben, dass Akkus Ressourcen verbrauchen, überwiegt meines Erachtens die Barrierefreiheit. Die Anpassung der Schriftgröße erleichtert das Lesen erheblich..."
      }
    ]
  },
  {
    step: 2,
    examinerText: "Das ist ein sehr starkes Argument, das man nicht vernachlässigen darf. Die Inklusion von älteren Lesern ist wichtig. Vielen Dank für diese lebhafte und strukturierte Debatte. Sie haben Ihre Argumente hervorragend untermauert!",
    userOptions: []
  }
];

export default function SprechenPage() {

  // Voice Recording Simulator State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioSaved, setAudioSaved] = useState(false);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Voice Recording API State
  const [speakingScores, setSpeakingScores] = useState<any>({
    pronunciation: 82,
    fluency: 78,
    grammar: 80,
    vocabulary: 85
  });
  const [speakingFeedback, setSpeakingFeedback] = useState<any[]>([
    { type: "pronunciation", title: "Pronunciation", detail: "Pay attention to word accent and syllable split in compound German nouns." },
    { type: "connectors", title: "Use Connectors", detail: "Integrate structured transitions (Redemittel) to link your pros and cons." },
    { type: "fluency", title: "Increase Fluency", detail: "Avoid long silent breaks. Use B2 filler concepts like „tatsächlich“ or „sozusagen“." }
  ]);
  const [speakingTranscript, setSpeakingTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Debate Simulator State
  const [isDebating, setIsDebating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [debateHistory, setDebateHistory] = useState<Array<{ sender: "examiner" | "user"; text: string }>>([]);

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  // Audio recording timer simulation
  useEffect(() => {
    if (isRecording) {
      setAudioSaved(false);
      recordingTimer.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    }

    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsEvaluating(true);
      setAudioSaved(false);

      try {
        // Create a mock audio blob to send to the backend API
        const mockAudioBlob = new Blob([new Uint8Array(100)], { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", mockAudioBlob, "speaking.wav");

        const res = await fetch("/api/evaluate/speaking", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Speaking evaluation failed");
        const data = await res.json();

        setSpeakingTranscript(data.transcript);
        setSpeakingScores(data.scores);
        setSpeakingFeedback(data.feedback);
        setAudioSaved(true);

        const scoreToSave = data.finalExamScore;

        setSyncStatus("syncing");
        // Save to localstorage
        try {
          const local = localStorage.getItem("b2_exam_progress");
          const progress = local ? JSON.parse(local) : { lesen_score: 0, hoeren_score: 0, schreiben_score: 0, sprechen_score: 0 };
          progress.sprechen_score = Math.max(progress.sprechen_score || 0, scoreToSave);
          localStorage.setItem("b2_exam_progress", JSON.stringify(progress));
          setSyncStatus("synced");
        } catch (err) {
          console.error("Local storage error:", err);
          setSyncStatus("error");
        }
      } catch (err) {
        console.error("Speaking evaluation error:", err);
        alert("Failed to evaluate speech recording.");
      } finally {
        setIsEvaluating(false);
      }
    } else {
      setRecordTime(0);
      setIsRecording(true);
    }
  };

  const handleToggleDebate = () => {
    const nextState = !isDebating;
    setIsDebating(nextState);
    if (nextState) {
      setCurrentStep(0);
      setDebateHistory([
        { sender: "examiner", text: examinerDebateFlow[0].examinerText }
      ]);
    } else {
      setDebateHistory([]);
      setCurrentStep(0);
      setSyncStatus("idle");
    }
  };

  const handleSelectDebateOption = (option: typeof examinerDebateFlow[0]["userOptions"][0]) => {
    const updatedHistory = [
      ...debateHistory,
      { sender: "user" as const, text: option.speechTemplate }
    ];
    setDebateHistory(updatedHistory);

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (nextStep < examinerDebateFlow.length) {
      setTimeout(async () => {
        setDebateHistory((prev) => [
          ...prev,
          { sender: "examiner", text: examinerDebateFlow[nextStep].examinerText }
        ]);

        if (nextStep === examinerDebateFlow.length - 1) {
          const debateScore = 52;
          
          setSyncStatus("syncing");
          // Save to localstorage
          try {
            const local = localStorage.getItem("b2_exam_progress");
            const progress = local ? JSON.parse(local) : { lesen_score: 0, hoeren_score: 0, schreiben_score: 0, sprechen_score: 0 };
            progress.sprechen_score = Math.max(progress.sprechen_score || 0, debateScore);
            localStorage.setItem("b2_exam_progress", JSON.stringify(progress));
            setSyncStatus("synced");
          } catch (err) {
            console.error("Local storage error:", err);
            setSyncStatus("error");
          }
        }
      }, 1500);
    }
  };

  const formatRecordTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top action bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-650 dark:bg-rose-950 dark:text-rose-455">
            <Mic className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Speaking Module</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Goethe B2 - Oral Expression</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">Debate Mode:</span>
          <button
            onClick={handleToggleDebate}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDebating ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDebating ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sync Banner */}
      {syncStatus !== "idle" && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between font-semibold ${
          syncStatus === "syncing" ? "bg-slate-100 text-slate-655 dark:bg-slate-900" :
          syncStatus === "synced" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
          "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455"
        }`}>
          <div className="flex items-center gap-1.5">
            <CloudLightning className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} />
            <span>
              {syncStatus === "syncing" && "Saving oral score..."}
              {syncStatus === "synced" && "Progress saved locally!"}
              {syncStatus === "error" && "Error saving score."}
            </span>
          </div>
          {syncStatus === "synced" && <span className="text-[10px] font-bold">Saved</span>}
        </div>
      )}

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8 overflow-y-auto">
        <div className="lg:col-span-2 space-y-6">
          {!isDebating ? (
            <>
              {/* Exam Prompt Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  Part 2: Presentation
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
                  Topic: Kostenloser öffentlicher Nahverkehr (ÖPNV)
                </h3>
                <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
                  Present the topic. Explain advantages and disadvantages, share your personal opinion, and briefly describe the situation in your home country.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] md:text-xs text-slate-450 dark:text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950">Prep Time: 15 Min</span>
                  <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950">Speaking Time: ca. 3 Min</span>
                </div>
              </div>

              {/* Recorder UI Widget */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Voice Recording</h4>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">
                    {formatRecordTime(recordTime)}
                  </div>
                  {isRecording && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-bold animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Recording...
                    </span>
                  )}
                  {isEvaluating && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-550 font-bold animate-pulse">
                      Analyzing speech...
                    </span>
                  )}
                </div>

                <div className="flex justify-center py-4">
                  <button
                    onClick={handleStartRecording}
                    disabled={isEvaluating}
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 shadow-lg ${
                      isRecording
                        ? "bg-rose-500 text-white shadow-rose-500/30 ring-8 ring-rose-500/10 scale-105"
                        : isEvaluating
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                    }`}
                  >
                    {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}

                    {isRecording && (
                      <>
                        <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping" />
                        <div className="absolute -inset-4 rounded-full border border-rose-500/10 animate-pulse" />
                      </>
                    )}
                  </button>
                </div>

                {isRecording && (
                  <div className="h-8 flex justify-center items-center gap-0.5">
                    {[10, 24, 12, 30, 45, 20, 15, 34, 40, 12, 10, 24, 40, 15, 32, 12, 8].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-rose-450 dark:bg-rose-500 rounded-full transition-all duration-200"
                        style={{
                          height: `${Math.max(4, h * (0.3 + Math.random() * 0.7))}px`
                        }}
                      />
                    ))}
                  </div>
                )}

                {isEvaluating && (
                  <div className="h-8 flex justify-center items-center gap-1">
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                {audioSaved && !isRecording && !isEvaluating && (
                  <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 max-w-sm mx-auto flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                      <span>Recording evaluated!</span>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                      <Play className="h-3 w-3" /> Listen
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal max-w-xs mx-auto">
                  Click the microphone to practice speaking. When authenticated, your speaking score synchronizes with Supabase.
                </p>
              </div>

              {/* Dynamic Transcript Box */}
              {speakingTranscript && !isRecording && !isEvaluating && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-3 animate-fadeIn text-left">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    <span>Transcribed Audio (German)</span>
                  </h4>
                  <p className="text-xs md:text-sm text-slate-705 dark:text-slate-300 italic leading-relaxed">
                    "{speakingTranscript}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px] overflow-hidden">
              {/* Examiner Header */}
              <div className="bg-slate-50/75 border-b border-slate-100 px-5 py-4 dark:bg-slate-950 dark:border-slate-800 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs dark:bg-rose-950 dark:text-rose-300">
                  AI
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-855 dark:text-slate-150">Examiner: Dr. Weber</h4>
                  <span className="text-[10px] text-slate-405 dark:text-slate-550 flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Debate Active
                  </span>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-sm">
                {debateHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-rose-500 text-white rounded-tr-none"
                          : "bg-slate-50 border border-slate-100 text-slate-800 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-250 rounded-tl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Action Input */}
              <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/20">
                {currentStep < examinerDebateFlow.length && examinerDebateFlow[currentStep].userOptions.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your argumentative options (B2):</p>
                    <div className="grid gap-2">
                      {examinerDebateFlow[currentStep].userOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectDebateOption(opt)}
                          className="w-full text-left rounded-xl border border-slate-200 bg-white p-3.5 hover:border-rose-400 transition-all text-xs text-slate-650 hover:bg-rose-50/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-500 flex items-center justify-between"
                        >
                          <span className="pr-4 italic">"{opt.text}"</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
                      Debate completed! Evaluation generated.
                    </span>
                    <button
                      onClick={handleToggleDebate}
                      className="mt-3 block mx-auto text-xs text-rose-500 font-bold hover:underline"
                    >
                      Restart Debate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Speech Analyzer */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-extrabold text-slate-855 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-rose-500" />
              <span>Speech Analyzer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Detailed analysis of your oral presentation, pronunciation, and fluency indicators.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Pronunciation</span>
                  <span className="text-slate-800 dark:text-slate-200">{speakingScores.pronunciation}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${speakingScores.pronunciation}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Fluency</span>
                  <span className="text-slate-800 dark:text-slate-200">{speakingScores.fluency}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${speakingScores.fluency}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Grammatical Accuracy</span>
                  <span className="text-slate-800 dark:text-slate-200">{speakingScores.grammar}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${speakingScores.grammar}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">B2 Vocabulary & Idioms</span>
                  <span className="text-slate-800 dark:text-slate-200">{speakingScores.vocabulary}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${speakingScores.vocabulary}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">B2 Feedback Recommendations</h4>
              <ul className="space-y-3.5 text-xs text-slate-655 dark:text-slate-450 leading-relaxed">
                {speakingFeedback.map((item: any, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>{item.title}:</strong> {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
