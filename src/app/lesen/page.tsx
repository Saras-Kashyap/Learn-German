"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Info,
  RotateCcw,
  BookMarked,
  CloudLightning
} from "lucide-react";

// Vocabulary terms with definitions for the highlighting feature
const vocabularyTerms = [
  { phrase: "Mobilitätswende", translation: "mobility transition", definition: "Der Übergang von fossilen Brennstoffen zu nachhaltigen Transportmitteln." },
  { phrase: "Klimaschutzzielen", translation: "climate protection targets", definition: "Vereinbarte Grenzwerte zur Reduktion von Treibhausgasen." },
  { phrase: "infrage stellen", translation: "to call into question / query", definition: "Zweifeln an etwas äußern oder die Gültigkeit von etwas bezweifeln." },
  { phrase: "Rohstoffgewinnung", translation: "raw material extraction", definition: "Das Abbauen oder Gewinnen von natürlichen Ressourcen wie Lithium oder Kobalt." },
  { phrase: "Ökobilanz", translation: "ecological balance sheet", definition: "Die Gesamtbewertung der Umweltwirkungen eines Produkts über dessen Lebenszyklus." },
  { phrase: "Ausbau", translation: "expansion / extension", definition: "Die Vergrößerung oder qualitative Verbesserung einer Infrastruktur." },
  { phrase: "nachhaltige", translation: "sustainable", definition: "Ressourcenschonend, so dass zukünftige Generationen nicht beeinträchtigt werden." },
  { phrase: "Fachkräftemangels", translation: "shortage of skilled workers", definition: "Ein Mangel an qualifizierten Arbeitskräften in einer Wirtschaft." },
  { phrase: "kompensieren", translation: "to compensate / offset", definition: "Einen Ausgleich für einen Verlust oder Nachteil schaffen." },
  { phrase: "Wettbewerbsfähigkeit", translation: "competitiveness", definition: "Die Fähigkeit eines Unternehmens oder Landes, im Vergleich mit anderen erfolgreich zu sein." },
  { phrase: "Entgrenzung", translation: "blurring of boundaries", definition: "Das Auflösen von festen Grenzen, hier zwischen Freizeit und Arbeitszeit." }
];

// Fallback Mock Data if DB is empty
const defaultArticleText = {
  title: "Die Mobilitätswende: Sind Elektroautos die Zukunft?",
  content: `Die Diskussion über die globale Klimaerwärmung hat dazu geführt, dass viele Staaten ehrgeizige Pläne zur Reduzierung von Treibhausgasen geschmiedet haben. Ein zentraler Baustein in diesem Vorhaben ist die sogenannte Mobilitätswende. Um die Klimaschutzziele zu erreichen, setzen Regierungen weltweit auf den raschen Übergang zu Elektrofahrzeugen. Doch während Befürworter das emissionsfreie Fahren im Stadtverkehr loben, stellen Skeptiker die tatsächliche Umweltfreundlichkeit dieser Technologie infrage.

Das Hauptargument für Elektroautos liegt auf der Hand: Sie stoßen beim Fahren kein gesundheitsschädliches Kohlendioxid (CO2) aus. Dies trägt erheblich zur Luftreinhaltung in Ballungsräumen bei und senkt zudem die Lärmbelästigung. Insbesondere in Großstädten verspricht die Technologie somit eine spürbare Steigerung der Lebensqualität. Wenn der genutzte Strom darüber hinaus aus erneuerbaren Energien wie Wind oder Sonne stammt, bewegen sich Elektroautos nahezu klimaneutral.

Kritiker verweisen jedoch auf die Schattenseiten, insbesondere auf die Rohstoffgewinnung für die Batterien. Die Förderung von Lithium und Kobalt erfolgt häufig unter fragwürdigen ökologischen und sozialen Bedingungen in Entwicklungsländern. Zudem verschlingt die Produktion einer Batterie enorme Mengen an Energie. Dies führt dazu, dass ein Elektroauto mit einem erheblichen ökologischen Rucksack auf die Straße kommt. Erst nach mehreren zehntausend Kilometern Fahrleistung gleicht sich die Ökobilanz im Vergleich zu einem modernen Diesel- oder Benzinmotor aus.

Ein weiteres Hindernis stellt die derzeitige Infrastruktur dar. Der Ausbau von Ladesäulen hinkt in vielen Regionen dem Verkauf von E-Autos hinterher. Längere Fahrten erfordern daher eine genaue Planung, und das Laden kann im Vergleich zum klassischen Tanken sehr viel Zeit in Anspruch nehmen. Dennoch bleibt die Elektromobilität ein unverzichtbarer Teil einer Strategie, die auf nachhaltige Entwicklung und den Abschied von fossilen Brennstoffen zielt.`
};

const questions = [
  {
    id: 1,
    question: "Was ist das Hauptziel der erwähnten Mobilitätswende?",
    options: [
      "Die Reduzierung der Autoproduktion weltweit.",
      "Die Erreichung der gesetzten Klimaschutzziele durch nachhaltigen Verkehr.",
      "Die vollständige Abschaffung des öffentlichen Nahverkehrs.",
      "Die finanzielle Unterstützung von Automobilkonzernen."
    ],
    correctAnswer: 1,
    explanation: "Der Text stellt im ersten Absatz klar, dass die Mobilitätswende und der Übergang zu E-Autos dazu dienen, die vereinbarten Klimaschutzziele zu erreichen."
  },
  {
    id: 2,
    question: "Unter welcher Bedingung fahren Elektroautos laut Text nahezu klimaneutral?",
    options: [
      "Wenn sie ausschließlich auf Autobahnen gefahren werden.",
      "Wenn die Batterien in Europa recycelt werden.",
      "Wenn der geladene Strom aus Wind- oder Sonnenenergie erzeugt wird.",
      "Wenn der Fahrer eine moderate Geschwindigkeit einhält."
    ],
    correctAnswer: 2,
    explanation: "Im zweiten Absatz heißt es: 'Wenn der genutzte Strom darüber hinaus aus erneuerbaren Energien wie Wind oder Sonne stammt, bewegen sich Elektroautos nahezu klimaneutral.'"
  },
  {
    id: 3,
    question: "Warum betrachten Kritiker Elektroautos skeptisch?",
    options: [
      "Sie halten Elektroautos für unbezahlbar für Durchschnittsbürger.",
      "Sie bezweifeln, dass Batterien überhaupt aufgeladen werden können.",
      "Sie verweisen auf die umweltschädliche Rohstoffgewinnung und die energieintensive Batterieproduktion.",
      "E-Autos verursachen laut Kritikern mehr Lärm als klassische Verbrennungsmotoren."
    ],
    correctAnswer: 3,
    explanation: "Absatz drei erläutert, dass Kritiker die Schattenseiten wie die Rohstoffgewinnung (Lithium/Kobalt) unter fragwürdigen ökologischen Bedingungen und die energieintensive Produktion betonen."
  },
  {
    id: 4,
    question: "Wann gleicht sich die Ökobilanz eines Elektrofahrzeugs im Vergleich zu Verbrennern aus?",
    options: [
      "Direkt nach dem Kauf im Autohaus.",
      "Erst nach mehreren zehntausend gefahrenen Kilometern.",
      "Sobald die Ladeinfrastruktur flächendeckend ausgebaut ist.",
      "Nachdem die Batterien zum ersten Mal ausgetauscht wurden."
    ],
    correctAnswer: 1,
    explanation: "Laut Absatz drei gleicht sich die Ökobilanz erst nach mehreren zehntausend Kilometern Fahrleistung aus, da das E-Auto anfangs mit einem 'ökologischen Rucksack' startet."
  }
];

export default function LesenPage() {
  const supabase = createClient();

  const [highlightVocab, setHighlightVocab] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [activeVocab, setActiveVocab] = useState<typeof vocabularyTerms[0] | null>(null);

  // Supabase State
  const [article, setArticle] = useState<{ title: string; paragraphs: string[] } | null>(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  // Dynamic RSS scraping state
  const [activeQuestions, setActiveQuestions] = useState<any[]>(questions);
  const [fetchingRss, setFetchingRss] = useState(false);
  const [rssSource, setRssSource] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionAndData = async () => {
      try {
        const { data, error } = await supabase
          .from("reading_materials")
          .select("*")
          .eq("title", defaultArticleText.title)
          .maybeSingle();

        if (data) {
          setArticle({
            title: data.title,
            paragraphs: data.content.split("\n\n").filter(Boolean)
          });
          setIsDbLoaded(true);
        } else {
          setArticle({
            title: defaultArticleText.title,
            paragraphs: defaultArticleText.content.split("\n\n").filter(Boolean)
          });
        }
      } catch (err) {
        console.error("Error reading from Supabase", err);
        setArticle({
          title: defaultArticleText.title,
          paragraphs: defaultArticleText.content.split("\n\n").filter(Boolean)
        });
      }
    };

    loadSessionAndData();
  }, [supabase]);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const score = Object.keys(selectedAnswers).reduce((acc, qId) => {
    const question = activeQuestions.find((q) => q.id === parseInt(qId));
    if (question && selectedAnswers[question.id] === question.correctAnswer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const handleCheckAnswers = () => {
    setShowResults(true);

    const finalScore = Math.round((score / activeQuestions.length) * 60);
    setSyncStatus("syncing");

    // Save to localstorage
    try {
      const local = localStorage.getItem("b2_exam_progress");
      const progress = local ? JSON.parse(local) : { lesen_score: 0, hoeren_score: 0, schreiben_score: 0, sprechen_score: 0 };
      progress.lesen_score = Math.max(progress.lesen_score || 0, finalScore);
      localStorage.setItem("b2_exam_progress", JSON.stringify(progress));
      setSyncStatus("synced");
    } catch (err) {
      console.error("Local storage error:", err);
      setSyncStatus("error");
    }
  };

  const handleFetchRSS = async () => {
    setFetchingRss(true);
    setSyncStatus("idle");
    try {
      const res = await fetch("/api/reading/scrape");
      if (!res.ok) throw new Error("Failed to fetch RSS feed");
      const data = await res.json();
      
      setArticle({
        title: data.title,
        paragraphs: data.content.split("\n\n").filter(Boolean)
      });
      setActiveQuestions(data.questions);
      setRssSource(data.source);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error("Error fetching RSS article:", err);
      alert("Error scraping article from RSS feed. Please try again.");
    } finally {
      setFetchingRss(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setActiveVocab(null);
    setSyncStatus("idle");
  };

  const renderParagraph = (text: string, index: number) => {
    if (!highlightVocab) {
      return <p key={index} className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-350">{text}</p>;
    }

    let tokens: React.ReactNode[] = [text];

    vocabularyTerms.forEach((vocab) => {
      const newTokens: React.ReactNode[] = [];
      tokens.forEach((token) => {
        if (typeof token !== "string") {
          newTokens.push(token);
          return;
        }

        const parts = token.split(new RegExp(`(${vocab.phrase})`, "gi"));
        parts.forEach((part, pIdx) => {
          if (part.toLowerCase() === vocab.phrase.toLowerCase()) {
            newTokens.push(
              <span
                key={`${vocab.phrase}-${pIdx}`}
                onClick={() => setActiveVocab(vocab)}
                className="cursor-pointer border-b-2 border-indigo-400 bg-indigo-50 px-0.5 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-500"
                title="Click for B2 translation"
              >
                {part}
              </span>
            );
          } else {
            newTokens.push(part);
          }
        });
      });
      tokens = newTokens;
    });

    return (
      <p key={index} className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-350">
        {tokens}
      </p>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top action bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Reading Module</h1>
            <p className="text-xs text-slate-405 dark:text-slate-500">
              {rssSource ? `📰 RSS: ${rssSource}` : "📖 Standard Article Mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFetchRSS}
            disabled={fetchingRss}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-600 px-4 py-2 text-xs font-semibold hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 transition-all border border-indigo-200/50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{fetchingRss ? "Scraping..." : "Scrape Tagesschau RSS"}</span>
          </button>

          <button
            onClick={() => setHighlightVocab(!highlightVocab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all border ${
              highlightVocab
                ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <BookMarked className="h-4 w-4" />
            <span>Highlight Vocabulary</span>
          </button>

          {showResults && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-55 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus !== "idle" && (
        <div className={`px-6 py-2 text-xs flex items-center justify-between font-semibold ${
          syncStatus === "syncing" ? "bg-slate-100 text-slate-650 dark:bg-slate-900" :
          syncStatus === "synced" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" :
          "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455"
        }`}>
          <div className="flex items-center gap-1.5">
            <CloudLightning className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} />
            <span>
              {syncStatus === "syncing" && "Saving exam score..."}
              {syncStatus === "synced" && "Progress saved locally!"}
              {syncStatus === "error" && "Error saving score."}
            </span>
          </div>
          {syncStatus === "synced" && <span className="text-[10px] font-bold uppercase">Saved</span>}
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="flex-1 grid md:grid-cols-2 overflow-hidden h-[calc(100vh-73px-64px)] md:h-[calc(100vh-73px)]">
        {/* Left Screen: Article */}
        <div className="overflow-y-auto p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20">
          <div className="max-w-xl mx-auto space-y-6">
            {article ? (
              <>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                  {article.title}
                </h2>
                
                <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 border border-slate-202/50 dark:bg-slate-900/50 dark:border-slate-800 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    Read the text carefully. Turn on vocabulary highlighting to view translations and definitions of B2 keywords.
                  </span>
                </div>

                <div className="space-y-4">
                  {article.paragraphs.map((para, idx) => renderParagraph(para, idx))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              </div>
            )}

            {/* Vocabulary Explanation Drawer */}
            {activeVocab && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 relative animate-fadeIn">
                <button
                  onClick={() => setActiveVocab(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
                >
                  ✕
                </button>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
                    B2 Vocabulary Explanation
                  </h4>
                </div>
                <p className="text-base font-semibold text-slate-850 dark:text-slate-100">
                  {activeVocab.phrase}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  English: <span className="italic font-medium">{activeVocab.translation}</span>
                </p>
                <p className="text-xs md:text-sm text-slate-650 dark:text-slate-350 mt-2">
                  {activeVocab.definition}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Right Screen: Questions */}
        <div className="overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center justify-between">
              <span>Questions</span>
              {showResults && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                  Score: {score} / {activeQuestions.length} Correct
                </span>
              )}
            </h3>

            <div className="space-y-6">
              {activeQuestions.map((q, qIdx) => {
                const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-slate-900 ${
                      showResults
                        ? isCorrect
                          ? "border-emerald-500 ring-2 ring-emerald-500/10 dark:border-emerald-700"
                          : "border-rose-500 ring-2 ring-rose-500/10 dark:border-rose-700"
                        : "border-slate-202 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm md:text-base font-bold text-slate-850 dark:text-slate-100 leading-tight">
                        {q.question}
                      </h4>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {q.options.map((option: string, optIdx: number) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isThisCorrect = q.correctAnswer === optIdx;

                        let optionStyle = "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60";
                        if (isSelected) {
                          optionStyle = "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-300";
                        }

                        if (showResults) {
                          if (isThisCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-950/40 dark:text-emerald-300";
                          } else if (isSelected && !isThisCorrect) {
                            optionStyle = "border-rose-500 bg-rose-50 text-rose-800 dark:border-rose-950/40 dark:text-rose-300";
                          } else {
                            optionStyle = "border-slate-100 opacity-60 dark:border-slate-800";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={showResults}
                            className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-xs md:text-sm font-medium transition-all ${optionStyle}`}
                          >
                            <span className="pr-4">{option}</span>
                            <div className="shrink-0">
                              {showResults && isThisCorrect && (
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {showResults && isSelected && !isThisCorrect && (
                                <XCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
                              )}
                              {!showResults && (
                                <div
                                  className={`h-4.5 w-4.5 rounded-full border ${
                                    isSelected
                                      ? "border-indigo-600 bg-indigo-600 flex items-center justify-center dark:border-indigo-500"
                                      : "border-slate-305 dark:border-slate-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-650 dark:bg-slate-950 dark:text-slate-400 border border-slate-200/30 dark:border-slate-800 flex gap-2">
                        <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-205">Explanation: </span>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Check Button */}
            {!showResults && (
              <button
                onClick={handleCheckAnswers}
                disabled={Object.keys(selectedAnswers).length < activeQuestions.length}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all disabled:bg-slate-200 disabled:text-slate-450 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Verify Answers</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
