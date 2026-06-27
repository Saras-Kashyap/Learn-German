import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // The request should contain an audio blob (sent via FormData)
    const contentType = req.headers.get("content-type") || "";
    
    // Just parsing form data or body to acknowledge receipt of the request
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio");
      if (!audioFile) {
        console.warn("No audio file found in speaking request form-data.");
      }
    } else {
      // Body might be a direct blob or empty
      const _body = await req.blob().catch(() => null);
    }

    // Return a mock response with transcription, scores, and feedback
    const transcript = "In meiner Präsentation möchte ich über das Thema 'Kostenloser öffentlicher Nahverkehr' sprechen. Einerseits ist es ein großer Vorteil für den Klimaschutz, wenn weniger Autos fahren. Andererseits ist die Finanzierung ein großes Problem, da der Staat viel Geld ausgeben müsste. In meinem Heimatland ist der öffentliche Nahverkehr leider nicht kostenlos, aber sehr günstig.";

    const scores = {
      pronunciation: 84,
      fluency: 79,
      grammar: 81,
      vocabulary: 86
    };

    const feedback = [
      {
        type: "pronunciation",
        title: "Pronunciation",
        detail: "Pay attention to word accent and syllable split in compound German nouns like 'Klimaschutz' and 'Nahverkehr'."
      },
      {
        type: "connectors",
        title: "Use Connectors",
        detail: "Integrate structured transitions (Redemittel) like 'zwar... aber...' or 'im Gegensatz zu...' to link your pros and cons."
      },
      {
        type: "fluency",
        title: "Increase Fluency",
        detail: "Avoid long silent breaks. Use B2 filler concepts like 'tatsächlich', 'sozusagen' or 'gewissermaßen'."
      }
    ];

    // Compute the overall exam score for the speaking module (max 60)
    // Average of the scores scaled to 60 points
    const avgScore = (scores.pronunciation + scores.fluency + scores.grammar + scores.vocabulary) / 4;
    const finalExamScore = Math.round((avgScore / 100) * 60);

    return NextResponse.json({
      transcript,
      scores,
      feedback,
      finalExamScore
    });
  } catch (error: any) {
    console.error("Error evaluating speaking:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
