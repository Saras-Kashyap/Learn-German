import { NextResponse } from "next/server";

export async function GET() {
  // Simulate fetching a German news RSS feed
  const mockFeedSource = "https://www.tagesschau.de/infosocial/index.xml";
  
  // Simulated article text for B2 practice
  const title = "Die Zukunft der Arbeit: Homeoffice und Vier-Tage-Woche im Trend";
  const content = `Die Digitalisierung hat in den letzten Jahren die Art und Weise, wie wir arbeiten, grundlegend verändert. Besonders das Homeoffice hat sich in vielen Branchen als feste Alternative zum klassischen Büroarbeitsplatz etabliert. Während Arbeitnehmer die gewonnene zeitliche Flexibilität und den Wegfall des täglichen Arbeitswegs schätzen, warnen Kritiker vor der Entgrenzung der Arbeit und dem Verlust sozialer Kontakte.

Eng verbunden mit dieser Entwicklung ist die Diskussion über die Einführung der Vier-Tage-Woche bei vollem Lohnausgleich. Befürworter betonen, dass eine verkürzte Arbeitszeit die Zufriedenheit und Leistungsfähigkeit der Beschäftigten steigert sowie das Risiko von Burnout verringert. Sie argumentieren, dass erholte Mitarbeiter produktiver arbeiten und in weniger Zeit die gleiche Leistung erbringen können.

Auf der anderen Seite äußern Wirtschaftsverbände erhebliche Bedenken. In Zeiten des akuten Fachkräftemangels sei eine pauschale Arbeitszeitverkürzung für viele Unternehmen nicht tragbar. Insbesondere im Handwerk, in der Pflege oder im Dienstleistungssektor könne man die ausfallende Arbeitszeit nicht einfach durch höhere Produktivität kompensieren. Eine flächendeckende Vier-Tage-Woche könnte somit die Wettbewerbsfähigkeit der deutschen Wirtschaft gefährden.

Zusammenfassend lässt sich sagen, dass moderne Arbeitsmodelle sowohl große Chancen als auch Risiken bieten. Für eine erfolgreiche Umsetzung bedarf es flexibler Lösungen, die sowohl die Bedürfnisse der Arbeitnehmer als auch die wirtschaftlichen Realitäten der Unternehmen berücksichtigen.`;

  // 3 multiple-choice questions matching B2 UI
  const questions = [
    {
      id: 1,
      question: "Was ist ein im Text genannter Vorteil des Arbeitens im Homeoffice?",
      options: [
        "Die garantierte Beförderung nach wenigen Monaten.",
        "Der vollständige Verzicht auf wöchentliche Teambesprechungen.",
        "Die zeitliche Flexibilität und das Vermeiden des Arbeitswegs.",
        "Die kostenlose Bereitstellung von Büroausstattung durch den Staat."
      ],
      correctAnswer: 2,
      explanation: "Im ersten Absatz wird erläutert: 'Während Arbeitnehmer die gewonnene zeitliche Flexibilität und den Wegfall des täglichen Arbeitswegs schätzen...'"
    },
    {
      id: 2,
      question: "Welches Argument bringen Befürworter der Vier-Tage-Woche vor?",
      options: [
        "Sie führt automatisch zu einer Reduzierung des Gehalts.",
        "Sie erhöht die Zufriedenheit der Mitarbeiter und senkt das Burnout-Risiko.",
        "Sie zwingt Unternehmen dazu, mehr Zeitarbeiter einzustellen.",
        "Sie macht Überstunden gesetzlich komplett unzulässig."
      ],
      correctAnswer: 1,
      explanation: "Laut dem zweiten Absatz betonen Befürworter, 'dass eine verkürzte Arbeitszeit die Zufriedenheit und Leistungsfähigkeit der Beschäftigten steigert sowie das Risiko von Burnout verringert.'"
    },
    {
      id: 3,
      question: "Warum betrachten Wirtschaftsverbände die Vier-Tage-Woche skeptisch?",
      options: [
        "Sie befürchten, dass Arbeitnehmer in ihrer Freizeit zu viel reisen.",
        "Sie meinen, dass Homeoffice dadurch wieder abgeschafft werden müsste.",
        "Sie befürchten eine Gefährdung der wirtschaftlichen Wettbewerbsfähigkeit, besonders wegen des Fachkräftemangels.",
        "Sie bezweifeln, dass Arbeitnehmer vier Tage hintereinander konzentriert arbeiten können."
      ],
      correctAnswer: 2,
      explanation: "Im dritten Absatz steht: 'In Zeiten des akuten Fachkräftemangels sei eine pauschale Arbeitszeitverkürzung für viele Unternehmen nicht tragbar... Eine flächendeckende Vier-Tage-Woche könnte somit die Wettbewerbsfähigkeit der deutschen Wirtschaft gefährden.'"
    }
  ];

  return NextResponse.json({
    source: mockFeedSource,
    title,
    content,
    questions
  });
}
