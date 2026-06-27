"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  CloudLightning
} from "lucide-react";

// Mock B2 Dialogue Transcript
const transcriptText = {
  title: "Podcast: Lebenslanges Lernen – Ein Leben lang die Schulbank drücken?",
  speaker1: "Sabine (Moderatorin):",
  speaker1Text: "Hallo und herzlich willkommen zu unserem heutigen Podcast 'Wissen am Puls'. Bei mir im Studio ist heute Herr Dr. Thomas Meyer, Bildungsforscher an der Universität München. Wir sprechen über das Thema 'Lebenslanges Lernen'. Herr Dr. Meyer, früher hat man eine Ausbildung oder ein Studium absolviert und das war's. Warum müssen wir uns heute ständig weiterbilden?",
  speaker2: "Dr. Meyer (Bildungsforscher):",
  speaker2Text: "Guten Tag, Sabine. Nun, die Antwort liegt im rasanten Wandel unserer Arbeitswelt. Die Digitalisierung und die Einführung künstlicher Intelligenz führen dazu, dass erlerntes Wissen immer schneller veraltet. Fähigkeiten, die vor zehn Jahren noch ausreichten, sind heute oft überholt. Wer auf dem Arbeitsmarkt konkurrenzfähig bleiben möchte, muss flexibel sein und sich neue Kompetenzen aneignen. Aber es geht nicht nur um Karriere – wissenschaftliche Studien belegen auch, dass kontinuierliche geistige Aktivität das Gehirn bis ins hohe Alter fit hält."
};

// B2 Vocabulary
const vocabulary = [
  { term: "absolvieren", translation: "to graduate / complete", definition: "Eine Ausbildung, ein Studium oder eine Prüfung erfolgreich durchlaufen." },
  { term: "die Weiterbildung", translation: "further education", definition: "Das Vertiefen oder Erweitern von Kenntnissen nach dem ersten Berufsabschluss." },
  { term: "überholt", translation: "outdated", definition: "Nicht mehr zeitgemäß, veraltet oder nicht mehr gültig." },
  { term: "sich aneignen", translation: "to acquire (knowledge)", definition: "Wissen, Fertigkeiten oder Gewohnheiten durch Lernen aufnehmen." },
  { term: "konkurrenzfähig", translation: "competitive", definition: "In der Lage sein, sich im Wettbewerb mit anderen zu behaupten." },
  { term: "der Wandel", translation: "change / transition", definition: "Eine kontinuierliche Veränderung von Zuständen oder Systemen." }
];

const hoerenQuestions = [
  {
    id: 1,
    question: "Welchen Grund nennt Dr. Meyer hauptsächlich für die Notwendigkeit ständiger Weiterbildung?",
    options: [
      "Weil Unternehmen das gesetzliche Rentenalter anheben wollen.",
      "Weil der technologische Wandel erlerntes Wissen schnell veralten lässt.",
      "Weil Studiengebühren in Deutschland abgeschafft wurden.",
      "Weil Arbeitnehmer sonst keine Gehaltserhöhungen fordern dürfen."
    ],
    correctAnswer: 1,
    explanation: "Dr. Meyer erklärt, dass durch Digitalisierung und KI erlerntes Wissen schneller veraltet, wodurch ständige Anpassung notwendig wird."
  },
  {
    id: 2,
    question: "Welchen zusätzlichen Vorteil hat lebenslanges Lernen laut Dr. Meyer?",
    options: [
      "Es verkürzt die tägliche Arbeitszeit.",
      "Es verringert das Risiko von Arbeitsunfällen.",
      "Es fördert die soziale Mobilität im Ausland.",
      "Es hält das Gehirn gesund und geistig aktiv bis ins Alter."
    ],
    correctAnswer: 3,
    explanation: "Am Ende seines Beitrags erwähnt er, dass wissenschaftliche Studien belegen, dass kontinuierliche Aktivität das Gehirn bis ins hohe Alter fit hält."
  }
];

export default function HoerenPage() {

  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  const duration = 154; // 2:34 duration in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated playback effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return Math.min(prev + playbackRate, duration);
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackRate]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = clickX / width;
    setCurrentTime(Math.floor(newPercent * duration));
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const score = Object.keys(selectedAnswers).reduce((acc, qId) => {
    const question = hoerenQuestions.find((q) => q.id === parseInt(qId));
    if (question && selectedAnswers[question.id] === question.correctAnswer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleCheckAnswers = () => {
    setShowResults(true);

    const finalScore = Math.round((score / hoerenQuestions.length) * 60);
    setSyncStatus("syncing");

    // Save to localstorage
    try {
      const local = localStorage.getItem("b2_exam_progress");
      const progress = local ? JSON.parse(local) : { lesen_score: 0, hoeren_score: 0, schreiben_score: 0, sprechen_score: 0 };
      progress.hoeren_score = Math.max(progress.hoeren_score || 0, finalScore);
      localStorage.setItem("b2_exam_progress", JSON.stringify(progress));
      setSyncStatus("synced");
    } catch (err) {
      console.error("Local storage error:", err);
      setSyncStatus("error");
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentTime(0);
    setIsPlaying(false);
    setSyncStatus("idle");
  };

  // Waveform bar sizes
  const waveBars = [
    30, 45, 60, 20, 35, 70, 50, 40, 65, 80, 40, 25, 45, 60, 85, 30, 50, 75, 40, 35,
    60, 75, 55, 30, 40, 65, 90, 45, 35, 60, 50, 70, 80, 30, 45, 60, 25, 55, 40, 30
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top action bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Headphones className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Listening Module</h1>
            <p className="text-xs text-slate-405 dark:text-slate-500">Goethe B2 - Listening Comprehension Part 2</p>
          </div>
        </div>

        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-655 hover:bg-slate-55 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          {showTranscript ? <EyeOff className="h-4 w-4 text-emerald-500" /> : <Eye className="h-4 w-4" />}
          <span>{showTranscript ? "Hide Transcript" : "Show Transcript"}</span>
        </button>
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
              {syncStatus === "syncing" && "Saving listening result..."}
              {syncStatus === "synced" && "Progress saved locally!"}
              {syncStatus === "error" && "Error saving score."}
            </span>
          </div>
          {syncStatus === "synced" && <span className="text-[10px] font-bold">Saved</span>}
        </div>
      )}

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-8 overflow-y-auto">
        {/* Left Column: Player and Questions */}
        <div className="md:col-span-2 space-y-8">
          {/* Simulated Audio Player Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Clock className="h-3 w-3" /> Audio Track #1
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Duration: 2:34 Min
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Lebenslanges Lernen im Wandel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Listen to the discussion between Sabine and Dr. Meyer and answer the comprehension questions.
            </p>

            {/* Audio Waveform Visualization */}
            <div className="mt-8 h-20 flex items-end justify-between gap-1 px-2">
              {waveBars.map((height, idx) => {
                const progressPercent = (currentTime / duration) * 100;
                const barPositionPercent = (idx / waveBars.length) * 100;
                const isPassed = progressPercent >= barPositionPercent;

                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t transition-all duration-350 ${
                      isPlaying
                        ? isPassed
                          ? "bg-emerald-500 dark:bg-emerald-400"
                          : "bg-slate-200 dark:bg-slate-800"
                        : isPassed
                        ? "bg-emerald-500/75 dark:bg-emerald-400/75"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                    style={{
                      height: isPlaying
                        ? `${Math.max(12, height * (0.4 + Math.random() * 0.6))}%`
                        : `${height}%`,
                      transitionDelay: isPlaying ? `${idx * 15}ms` : "0ms"
                    }}
                  />
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div
                onClick={handleProgressBarClick}
                className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden relative"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-450 dark:text-slate-550 font-medium font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                onClick={handlePlayPause}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white ml-0.5" />}
              </button>

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {[0.8, 1.0, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      playbackRate === rate
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 h-1 rounded-full bg-slate-200 dark:bg-slate-850 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hidden Transcript */}
          {showTranscript && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-fadeIn">
              <div className="flex items-center gap-1.5 mb-4">
                <Sparkles className="h-4.5 w-4.5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Audio Script</h3>
              </div>
              <h4 className="text-sm font-bold text-slate-855 dark:text-slate-200 mb-3">{transcriptText.title}</h4>
              <div className="space-y-4 text-xs md:text-sm leading-relaxed text-slate-655 dark:text-slate-350">
                <div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">{transcriptText.speaker1}</p>
                  <p className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl">{transcriptText.speaker1Text}</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{transcriptText.speaker2}</p>
                  <p className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl">{transcriptText.speaker2Text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comprehension Quiz */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center justify-between">
              <span>Comprehension Questions</span>
              {showResults && (
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                  Reset
                </button>
              )}
            </h3>

            <div className="space-y-6">
              {hoerenQuestions.map((q, qIdx) => {
                const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
                      showResults
                        ? isCorrect
                          ? "border-emerald-500 ring-2 ring-emerald-500/10"
                          : "border-rose-500 ring-2 ring-rose-500/10"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-850">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm md:text-base font-bold text-slate-855 dark:text-slate-100 leading-tight">
                        {q.question}
                      </h4>
                    </div>

                    <div className="mt-4 space-y-2">
                      {q.options.map((option, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isThisCorrect = q.correctAnswer === optIdx;

                        let style = "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40";
                        if (isSelected) {
                          style = "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-350";
                        }

                        if (showResults) {
                          if (isThisCorrect) {
                            style = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300";
                          } else if (isSelected) {
                            style = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300";
                          } else {
                            style = "opacity-50 border-slate-100 dark:border-slate-800";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            disabled={showResults}
                            className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-xs md:text-sm font-medium transition-all ${style}`}
                          >
                            <span>{option}</span>
                            <div className="shrink-0 ml-4">
                              {showResults && isThisCorrect && (
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                              )}
                              {showResults && isSelected && !isThisCorrect && (
                                <XCircle className="h-4.5 w-4.5 text-rose-600" />
                              )}
                              {!showResults && (
                                <div
                                  className={`h-4 w-4 rounded-full border ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-500"
                                      : "border-slate-300 dark:border-slate-600"
                                  }`}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400 border border-slate-200/20 dark:border-slate-800 flex gap-2">
                        <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation: </span>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showResults && (
              <button
                onClick={handleCheckAnswers}
                disabled={Object.keys(selectedAnswers).length < hoerenQuestions.length}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-400 transition-all disabled:bg-slate-250 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 shadow-emerald-500/10"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Verify Answers</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Vocabulary */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-extrabold text-slate-855 dark:text-slate-100 flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <span>Vocabulary Box (B2)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Core B2 vocabulary terms from this dialogue. Learn these concepts for your writing and speaking tests.
            </p>

            <div className="space-y-3.5">
              {vocabulary.map((v, idx) => (
                <div
                  key={idx}
                  className="group rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-150 text-sm">
                      {v.term}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic">
                      {v.translation}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-655 dark:text-slate-400 leading-normal">
                    {v.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
