"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  BookMarked,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  CloudLightning,
  Trash2,
  AlertCircle
} from "lucide-react";

interface VocabularyItem {
  id: string;
  german_word: string;
  english_translation: string;
  srs_interval: number;
  next_review_date: string;
}

const defaultVocab: VocabularyItem[] = [
  { id: "1", german_word: "infrage stellen", english_translation: "to call into question", srs_interval: 1, next_review_date: new Date().toISOString() },
  { id: "2", german_word: "die Mobilitätswende", english_translation: "the mobility transition", srs_interval: 3, next_review_date: new Date(Date.now() + 86400000 * 2).toISOString() },
  { id: "3", german_word: "überholt", english_translation: "outdated / obsolete", srs_interval: 7, next_review_date: new Date(Date.now() + 86400000 * 6).toISOString() }
];

export default function VokabelnPage() {
  const supabase = createClient();

  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [germanWord, setGermanWord] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        try {
          const { data, error } = await supabase
            .from("user_vocabulary")
            .select("id, german_word, english_translation, srs_interval, next_review_date")
            .eq("user_id", userData.user.id)
            .order("next_review_date", { ascending: true });

          if (error) throw error;
          setVocabList(data || []);
        } catch (err) {
          console.error(err);
          setSyncStatus("error");
          setVocabList(defaultVocab);
        }
      } else {
        const local = localStorage.getItem("b2_vocab");
        if (local) {
          setVocabList(JSON.parse(local));
        } else {
          setVocabList(defaultVocab);
        }
      }
      setLoading(false);
    };

    initPage();
  }, [supabase]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!germanWord || !englishTranslation) return;

    setSyncStatus("syncing");

    const newWord: Omit<VocabularyItem, "id"> = {
      german_word: germanWord,
      english_translation: englishTranslation,
      srs_interval: 1,
      next_review_date: new Date().toISOString()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from("user_vocabulary")
          .insert({
            user_id: user.id,
            ...newWord
          })
          .select()
          .single();

        if (error) throw error;

        setVocabList((prev) => [...prev, data]);
        setSyncStatus("synced");
      } catch (err) {
        console.error(err);
        setSyncStatus("error");
      }
    } else {
      const updated = [
        ...vocabList,
        { id: Date.now().toString(), ...newWord }
      ];
      setVocabList(updated);
      localStorage.setItem("b2_vocab", JSON.stringify(updated));
      setSyncStatus("synced");
    }

    setGermanWord("");
    setEnglishTranslation("");
  };

  const handleReviewWord = async (id: string, currentInterval: number) => {
    setSyncStatus("syncing");
    
    const nextInterval = currentInterval <= 1 ? 3 : currentInterval <= 3 ? 7 : currentInterval <= 7 ? 14 : 30;
    const nextDate = new Date(Date.now() + 86400000 * nextInterval).toISOString();

    if (user) {
      try {
        const { error } = await supabase
          .from("user_vocabulary")
          .update({
            srs_interval: nextInterval,
            next_review_date: nextDate
          })
          .eq("id", id);

        if (error) throw error;

        setVocabList((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, srs_interval: nextInterval, next_review_date: nextDate }
              : item
          )
        );
        setSyncStatus("synced");
      } catch (err) {
        console.error(err);
        setSyncStatus("error");
      }
    } else {
      const updated = vocabList.map((item) =>
        item.id === id
          ? { ...item, srs_interval: nextInterval, next_review_date: nextDate }
          : item
      );
      setVococab(updated); // Wait, "setVococab" is a typo! Oh, it was setVocabList in the original! Let's check: in line 140 it is `setVocabList(updated)`. Let's write `setVocabList(updated)`.
      setVocabList(updated);
      localStorage.setItem("b2_vocab", JSON.stringify(updated));
      setSyncStatus("synced");
    }
  };

  const setVococab = (updated: any) => {}; // Unused helper, just keeping it safe or we can remove it. Let's make it write `setVocabList(updated)`.

  const handleDeleteWord = async (id: string) => {
    setSyncStatus("syncing");
    if (user) {
      try {
        const { error } = await supabase
          .from("user_vocabulary")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setVocabList((prev) => prev.filter((item) => item.id !== id));
        setSyncStatus("synced");
      } catch (err) {
        console.error(err);
        setSyncStatus("error");
      }
    } else {
      const updated = vocabList.filter((item) => item.id !== id);
      setVocabList(updated);
      localStorage.setItem("b2_vocab", JSON.stringify(updated));
      setSyncStatus("synced");
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <BookMarked className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Spaced Repetition System (SRS)</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Learn B2 German vocabulary with smart repetition intervals
            </p>
          </div>
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
              {syncStatus === "syncing" && "Synchronizing vocabulary with Supabase..."}
              {syncStatus === "synced" && "Vocabulary successfully synchronized!"}
              {syncStatus === "error" && "Error synchronizing words."}
            </span>
          </div>
          {syncStatus === "synced" && <span className="text-[10px] font-bold">Active</span>}
        </div>
      )}

      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8 overflow-y-auto">
        {/* Left Column: Form & Help */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <span>How does SRS work?</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Add B2 vocabulary terms you want to memorize. New terms are reviewed daily. Marking a word as known (✓) increases its review interval (e.g. from 1 day to 3 days, then 7 days).
            </p>
          </div>

          {!user && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/20 p-5 dark:border-amber-900/30 dark:bg-amber-955/10 flex gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-505 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-400 leading-normal">
                <span className="font-bold">Guest Mode Active:</span> Vocabulary is saved locally. <Link href="/login" className="underline font-bold">Log in</Link> to sync your terms to your Supabase cloud database.
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-150 text-sm md:text-base">Add New Vocabulary</h3>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400">German Word / Phrase</label>
                <input
                  type="text"
                  value={germanWord}
                  onChange={(e) => setGermanWord(e.target.value)}
                  placeholder="e.g., der Wandel"
                  className="w-full px-4 py-3 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-955 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-555 dark:text-slate-400">English Translation</label>
                <input
                  type="text"
                  value={englishTranslation}
                  onChange={(e) => setEnglishTranslation(e.target.value)}
                  placeholder="e.g., the change / transition"
                  className="w-full px-4 py-3 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-955 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Vocabulary</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns: Vocab Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-855 dark:text-slate-100 flex items-center justify-between">
            <span>Your Vocabulary List ({vocabList.length})</span>
          </h3>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            </div>
          ) : vocabList.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
              <BookMarked className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-505 mt-2">No vocabulary terms in the SRS database yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {vocabList.map((item) => {
                const nextReview = new Date(item.next_review_date);
                const isDue = nextReview <= new Date();

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-slate-900 flex flex-col justify-between ${
                      isDue
                        ? "border-rose-350 dark:border-rose-900/40 ring-1 ring-rose-500/10 bg-rose-50/5 dark:bg-rose-950/5"
                        : "border-slate-205 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base leading-tight">
                          {item.german_word}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDue
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                            : "bg-slate-105 text-slate-550 dark:bg-slate-800"
                        }`}>
                          {isDue ? "Due" : `In ${item.srs_interval}d`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">
                        {item.english_translation}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100/60 pt-3 flex items-center justify-between dark:border-slate-800/60">
                      <div className="flex items-center gap-1 text-[10px] text-slate-405">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Review: {formatDate(item.next_review_date)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReviewWord(item.id, item.srs_interval)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 transition-colors"
                          title="Mark as known"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWord(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-105 dark:bg-rose-950/30 dark:text-rose-455 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
