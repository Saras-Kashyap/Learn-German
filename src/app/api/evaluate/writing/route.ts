import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, subject } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    // Default base score depending on length, capped at 100
    let score = 50;
    if (wordCount >= 100 && wordCount <= 160) {
      score = 85;
    } else if (wordCount > 160) {
      score = 75; // Penalize slightly for over-length
    } else if (wordCount >= 50) {
      score = 65;
    } else {
      score = 40;
    }

    // Add some variation based on text content
    if (text.includes("Sehr geehrte Damen und Herren") || text.includes("Sehr geehrter Herr") || text.includes("Sehr geehrte Frau")) {
      score += 5;
    }
    if (text.includes("Mit freundlichen Grüßen")) {
      score += 5;
    }
    if (text.includes("weil") && text.includes("habe") && !text.includes("bestellt habe")) {
      // Common error detected
      score -= 8;
    }

    // Keep it between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Rule violations list
    const rule_violated = [];

    // Analyze text for typical B2 errors to present mock rule violations
    if (text.includes("weil ich habe") || text.toLowerCase().includes("weil ich gestern habe")) {
      rule_violated.push({
        original: "weil ich habe ... bestellt",
        corrected: "weil ich ... bestellt habe",
        rule: "Subordinate Clause Verb Placement (Nebensatz)",
        explanation: "In subordinate clauses introduced by the conjunction 'weil', the conjugated verb ('habe') must be placed at the very end of the clause."
      });
    }

    if (text.includes("Ich warte auf Ihre schnelle Antwort") || text.includes("Ich warte auf eine Antwort")) {
      rule_violated.push({
        original: "Ich warte auf Ihre schnelle Antwort.",
        corrected: "Über eine baldige Rückmeldung würde ich mich sehr freuen.",
        rule: "Polite Register / Subjunctive II (Konjunktiv II)",
        explanation: "Use the subjunctive II ('würde mich freuen') in formal correspondence to maintain a polite and advanced B2 tone."
      });
    }

    if (text.toLowerCase().includes("ich habe bestellt") && !text.toLowerCase().includes("bestellung aufgegeben")) {
      rule_violated.push({
        original: "ich habe bestellt",
        corrected: "ich habe eine Bestellung aufgegeben",
        rule: "B2 Nominal Style (Nomen-Verb-Verbindungen)",
        explanation: "To achieve a higher score in vocabulary range, consider replacing simple verbs with B2 nominal constructs."
      });
    }

    // Default corrections if none of the above are matched but the text is short
    if (rule_violated.length === 0) {
      rule_violated.push({
        original: "gute Qualitat",
        corrected: "gute Qualität",
        rule: "Umlaut Usage",
        explanation: "Always use correct German umlauts (ä, ö, ü) or their transcription (ae, oe, ue) if not available."
      });
    }

    // Reconstruct a corrected version of the text (mocked)
    let corrected_text = text;
    if (corrected_text.includes("weil ich habe vor einer Woche einen Laptop in Ihrem Online-Shop bestellt")) {
      corrected_text = corrected_text.replace(
        "weil ich habe vor einer Woche einen Laptop in Ihrem Online-Shop bestellt",
        "weil ich vor einer Woche einen Laptop in Ihrem Online-Shop bestellt habe"
      );
    }
    if (corrected_text.includes("Ich warte auf Ihre schnelle Antwort")) {
      corrected_text = corrected_text.replace(
        "Ich warte auf Ihre schnelle Antwort",
        "Über eine baldige Rückmeldung würde ich mich sehr freuen"
      );
    }

    return NextResponse.json({
      score,
      corrected_text,
      rule_violated
    });
  } catch (error: any) {
    console.error("Error evaluating writing:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
