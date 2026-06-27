"use server";

import { createClient } from "@/utils/supabase/server";

export interface ExamProgress {
  user_id: string;
  lesen_score: number | null;
  hoeren_score: number | null;
  schreiben_score: number | null;
  sprechen_score: number | null;
  updated_at: string;
}

export interface VocabularyItem {
  id: string;
  user_id: string;
  german_word: string;
  english_translation: string;
  srs_interval: number;
  next_review_date: string;
  created_at?: string;
}

/**
 * Fetch the current user's B2 exam scores from the `exam_progress` table.
 */
export async function fetchExamProgress() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("exam_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching exam progress:", error);
      return { data: null, error: error.message };
    }

    return { data: data as ExamProgress | null, error: null };
  } catch (err: any) {
    console.error("Unexpected error fetching exam progress:", err);
    return { data: null, error: err.message || "Unexpected error" };
  }
}

/**
 * Update the user's exam scores when a module is completed.
 * It will retain the higher score (i.e. using Math.max).
 */
export async function updateExamScore(
  moduleType: "lesen" | "hoeren" | "schreiben" | "sprechen",
  score: number
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    // Check if progress already exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from("exam_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing progress:", fetchError);
      return { data: null, error: fetchError.message };
    }

    const scoreField = `${moduleType}_score` as const;
    const currentScore = existingProgress ? (existingProgress[scoreField] || 0) : 0;
    const finalScore = Math.max(currentScore, score);

    const updatedData = {
      [scoreField]: finalScore,
      updated_at: new Date().toISOString(),
    };

    if (existingProgress) {
      const { data, error } = await supabase
        .from("exam_progress")
        .update(updatedData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating exam progress:", error);
        return { data: null, error: error.message };
      }
      return { data: data as ExamProgress, error: null };
    } else {
      const { data, error } = await supabase
        .from("exam_progress")
        .insert({
          user_id: user.id,
          ...updatedData,
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting exam progress:", error);
        return { data: null, error: error.message };
      }
      return { data: data as ExamProgress, error: null };
    }
  } catch (err: any) {
    console.error("Unexpected error updating exam progress:", err);
    return { data: null, error: err.message || "Unexpected error" };
  }
}

/**
 * Fetch the current user's vocabulary list.
 */
export async function fetchVocabulary() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("user_vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .order("next_review_date", { ascending: true });

    if (error) {
      console.error("Error fetching vocabulary:", error);
      return { data: null, error: error.message };
    }

    return { data: data as VocabularyItem[], error: null };
  } catch (err: any) {
    console.error("Unexpected error fetching vocabulary:", err);
    return { data: null, error: err.message || "Unexpected error" };
  }
}

/**
 * Add a new vocabulary word to the `user_vocabulary` table.
 */
export async function addVocabularyWord(word: {
  german_word: string;
  english_translation: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("user_vocabulary")
      .insert({
        user_id: user.id,
        german_word: word.german_word,
        english_translation: word.english_translation,
        srs_interval: 1,
        next_review_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting vocabulary word:", error);
      return { data: null, error: error.message };
    }

    return { data: data as VocabularyItem, error: null };
  } catch (err: any) {
    console.error("Unexpected error inserting vocabulary word:", err);
    return { data: null, error: err.message || "Unexpected error" };
  }
}

/**
 * Update the review interval (SRS) for a vocabulary word.
 */
export async function updateVocabularySRS(id: string, srsInterval: number, nextReviewDate: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("user_vocabulary")
      .update({
        srs_interval: srsInterval,
        next_review_date: nextReviewDate,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating vocabulary SRS:", error);
      return { data: null, error: error.message };
    }

    return { data: data as VocabularyItem, error: null };
  } catch (err: any) {
    console.error("Unexpected error updating vocabulary SRS:", err);
    return { data: null, error: err.message || "Unexpected error" };
  }
}

/**
 * Delete a vocabulary word from the user's list.
 */
export async function deleteVocabularyWord(id: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  try {
    const { error } = await supabase
      .from("user_vocabulary")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting vocabulary word:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Unexpected error deleting vocabulary word:", err);
    return { error: err.message || "Unexpected error" };
  }
}
