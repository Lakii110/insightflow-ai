import type { UploadedDoc, ChatMessage, EvidenceStatement } from "./store";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a combined text context from uploaded docs (budget ~8 000 chars total) */
export function buildDocContext(docs: UploadedDoc[]): string {
  if (docs.length === 0) return "No documents uploaded yet.";
  const budget = Math.floor(8000 / docs.length);
  return docs
    .map((d, i) =>
      `--- Document ${i + 1}: "${d.name}" (${d.wordCount} words) ---\n${d.content.slice(0, budget)}`
    )
    .join("\n\n");
}

/** Call OpenAI chat completions endpoint */
async function callOpenAI(
  body: object,
  apiKey: string
): Promise<{ choices: { message: { content: string } }[] }> {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      err.error?.message || `OpenAI API error ${res.status}`
    );
  }

  return res.json() as Promise<{
    choices: { message: { content: string } }[];
  }>;
}

/** Quick analysis of doc content without API */
function localAnalyze(docs: UploadedDoc[]) {
  const allTopics = [...new Set(docs.flatMap(d => d.topics))].slice(0, 8);
  const allText = docs.map(d => d.content).join(" ");
  const sentences = allText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 250 && !s.startsWith("["));
  const factSentences = sentences.filter(s =>
    /\d+%|\$\d+|research|study|found|data|shows?|evidence|key|important/i.test(s)
  );
  return {
    topics: allTopics,
    keyFacts: factSentences.slice(0, 5).length ? factSentences.slice(0, 5) : sentences.slice(0, 3),
  };
}

// ─── Chat ────────────────────────────────────────────────────────────────────

/** Send a chat message — uses real OpenAI if key exists, smart demo otherwise */
export async function sendChatMessage(
  userMessage: string,
  history: ChatMessage[],
  docs: UploadedDoc[],
  apiKey: string
): Promise<Partial<ChatMessage>> {
  // ── demo mode ──
  if (!apiKey || !apiKey.trim().startsWith("sk-")) {
    return demoChatResponse(userMessage, docs);
  }

  // ── real OpenAI ──
  const docContext = buildDocContext(docs);

  const systemPrompt = `You are InsightFlow AI — an evidence-based research assistant.
Answer ONLY using the uploaded documents below. Never hallucinate.

DOCUMENTS:
${docContext}

RESPONSE FORMAT — respond with valid JSON only (no markdown fences):
{
  "answer": "Your detailed answer",
  "confidence": 85,
  "evidenceSources": [
    { "docName": "exact filename", "excerpt": "verbatim quote ≤100 chars", "confidence": 90 }
  ],
  "weaknesses": ["any gaps or caveats"],
  "contradictions": ["any conflicts between documents"],
  "missingInfo": ["what extra data would help"],
  "nextQuestion": "one useful follow-up question"
}`;

  const data = await callOpenAI(
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    },
    apiKey
  );

  const raw = data.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as {
    answer?: string;
    confidence?: number;
    evidenceSources?: { docName: string; excerpt: string; confidence: number }[];
    weaknesses?: string[];
    contradictions?: string[];
    missingInfo?: string[];
    nextQuestion?: string;
  };

  return {
    content: parsed.answer || "No response generated.",
    confidence: parsed.confidence ?? 50,
    evidenceSources: parsed.evidenceSources || [],
    weaknesses: parsed.weaknesses || [],
    contradictions: parsed.contradictions || [],
    missingInfo: parsed.missingInfo || [],
    nextQuestion: parsed.nextQuestion || "",
  };
}

/** Demo chat — local text analysis, no API needed */
function demoChatResponse(
  userMessage: string,
  docs: UploadedDoc[]
): Partial<ChatMessage> {
  if (docs.length === 0) {
    return {
      content:
        "No documents uploaded yet.\n\nGo to **Documents** (sidebar) and upload your research files — PDF, DOCX, TXT or CSV. Once indexed I can answer questions with evidence from your content.",
      confidence: 0,
      evidenceSources: [],
      weaknesses: ["No documents loaded"],
      nextQuestion: "Upload a document first, then ask me anything about it.",
    };
  }

  const { topics, keyFacts } = localAnalyze(docs);
  const q = userMessage.toLowerCase();
  const evidenceSources: { docName: string; excerpt: string; confidence: number }[] = [];
  let answer = "";

  if (
    q.includes("summar") ||
    q.includes("overview") ||
    q.includes("what is") ||
    q.includes("what are") ||
    q.includes("about")
  ) {
    answer =
      `Here is a summary of your ${docs.length} uploaded document${docs.length > 1 ? "s" : ""}:\n\n` +
      docs
        .map(d => `**${d.name}**\n${d.summary}\nTopics: ${d.topics.join(", ")}`)
        .join("\n\n");
    docs.forEach(d => {
      const first = d.content.split(/[.!?]+/).find(s => s.trim().length > 40);
      if (first) evidenceSources.push({ docName: d.name, excerpt: first.trim().slice(0, 120), confidence: 80 });
    });
  } else if (q.includes("topic") || q.includes("theme") || q.includes("subject")) {
    answer =
      `Main topics across your documents:\n\n` +
      topics.map(t => `• **${t}**`).join("\n");
  } else if (q.includes("risk") || q.includes("problem") || q.includes("issue") || q.includes("challenge")) {
    const riskSentences = docs
      .flatMap(d =>
        d.content.split(/[.!?]+/)
          .filter(s => /risk|problem|challenge|issue|concern|threat|danger/i.test(s) && s.trim().length > 40)
          .slice(0, 2)
          .map(s => ({ doc: d.name, text: s.trim() }))
      )
      .slice(0, 4);
    if (riskSentences.length > 0) {
      answer = `Potential risks found in your documents:\n\n` +
        riskSentences.map((r, i) => `${i + 1}. ${r.text}`).join("\n\n");
      riskSentences.forEach(r => evidenceSources.push({ docName: r.doc, excerpt: r.text.slice(0, 120), confidence: 70 }));
    } else {
      answer = `No explicit risk statements found in your documents. The topics covered are: ${topics.join(", ")}.`;
    }
  } else if (keyFacts.length > 0) {
    answer =
      `Key findings from your documents relevant to your question:\n\n` +
      keyFacts.map((f, i) => `${i + 1}. ${f}`).join("\n\n");
    docs.forEach(d => {
      if (d.content && !d.content.startsWith("["))
        evidenceSources.push({ docName: d.name, excerpt: d.summary.slice(0, 120), confidence: 65 });
    });
  } else {
    answer =
      `Your ${docs.length} document${docs.length > 1 ? "s" : ""} cover these topics: ${topics.join(", ")}.\n\n` +
      `For precise evidence-backed answers, add your OpenAI API key in **Settings**. ` +
      `In demo mode I use local keyword analysis only.`;
  }

  return {
    content: answer.trim(),
    confidence: 60,
    evidenceSources,
    weaknesses: [
      "Demo mode — local analysis only, no AI reasoning",
      "Add OpenAI API key in Settings for full evidence-backed answers",
    ],
    missingInfo: [],
    nextQuestion: topics.length > 0 ? `What specific aspect of "${topics[0]}" would you like to explore?` : undefined,
  };
}

// ─── Evidence Check ──────────────────────────────────────────────────────────

export async function generateEvidenceCheck(
  docs: UploadedDoc[],
  apiKey: string
): Promise<EvidenceStatement[]> {
  if (docs.length === 0) return [];

  // ── demo mode ──
  if (!apiKey || !apiKey.trim().startsWith("sk-")) {
    return demoEvidence(docs);
  }

  // ── real OpenAI ──
  const docContext = buildDocContext(docs);

  const data = await callOpenAI(
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an evidence auditor. Extract 6-10 key factual claims from the documents and rate each one.

Respond with valid JSON only:
{
  "statements": [
    {
      "text": "The specific claim",
      "status": "supported",
      "confidence": 88,
      "sourceDoc": "exact filename",
      "excerpt": "exact quote supporting or refuting the claim",
      "reasoning": "Why this rating was given"
    }
  ]
}
status must be: "supported", "partial", or "unsupported" (no other values).`,
        },
        { role: "user", content: `Analyze:\n\n${docContext}` },
      ],
      temperature: 0.15,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    },
    apiKey
  );

  const parsed = JSON.parse(data.choices[0]?.message?.content || "{}") as {
    statements?: {
      text: string;
      status: "supported" | "partial" | "unsupported";
      confidence: number;
      sourceDoc: string;
      excerpt: string;
      reasoning: string;
    }[];
  };

  return (parsed.statements || []).map((s, i) => ({
    id: `stmt-${Date.now()}-${i}`,
    text: s.text,
    status: (["supported", "partial", "unsupported"].includes(s.status)
      ? s.status
      : "partial") as "supported" | "partial" | "unsupported",
    confidence: Math.max(0, Math.min(100, s.confidence)),
    sourceDoc: s.sourceDoc,
    excerpt: s.excerpt,
    reasoning: s.reasoning,
  }));
}

/** Demo evidence — local sentence analysis */
function demoEvidence(docs: UploadedDoc[]): EvidenceStatement[] {
  const results: EvidenceStatement[] = [];

  docs.forEach((doc, di) => {
    if (!doc.content || doc.content.startsWith("[")) return;

    const sentences = doc.content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 50 && s.length < 300)
      .slice(0, 3);

    sentences.forEach((sentence, si) => {
      const hasNumber  = /\d+/.test(sentence);
      const hasKeyword = /(show|found|indicate|demonstrate|confirm|reveal|data|research|study)/i.test(sentence);
      const status: "supported" | "partial" | "unsupported" =
        hasNumber && hasKeyword ? "supported" : hasNumber || hasKeyword ? "partial" : "partial";
      const confidence =
        status === "supported"
          ? 72 + Math.floor(Math.random() * 20)
          : 42 + Math.floor(Math.random() * 30);

      results.push({
        id: `demo-${di}-${si}`,
        text: sentence.slice(0, 200),
        status,
        confidence,
        sourceDoc: doc.name,
        excerpt: sentence.slice(0, 150),
        reasoning:
          status === "supported"
            ? "Contains specific data or quantitative evidence found directly in the document."
            : "Claim is present but lacks full corroborating data within the document.",
      });
    });
  });

  if (results.length === 0) {
    return [
      {
        id: "demo-empty",
        text: "Documents are indexed but no clear factual claims were detected automatically.",
        status: "partial",
        confidence: 40,
        sourceDoc: docs[0]?.name || "Unknown",
        excerpt: "(no extractable claim)",
        reasoning:
          "Add your OpenAI API key in Settings for deep AI-powered evidence analysis.",
      },
    ];
  }

  return results.slice(0, 8);
}

// ─── Report Generation ────────────────────────────────────────────────────────

export async function generateReport(
  docs: UploadedDoc[],
  reportType: string,
  persona: string,
  apiKey: string
): Promise<string> {
  if (docs.length === 0) {
    return "# No Documents\n\nUpload documents first to generate a report.";
  }

  // ── demo mode ──
  if (!apiKey || !apiKey.trim().startsWith("sk-")) {
    return demoReport(docs, reportType, persona);
  }

  // ── real OpenAI ──
  const docContext = buildDocContext(docs);

  const reportDesc: Record<string, string> = {
    executive: "Executive Summary: Key Findings, Opportunities, Risks, Recommended Actions",
    marketing:  "Marketing Report: Target Audience, Key Messages, Channel Strategy, Campaign Ideas",
    swot:       "SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats (3-5 bullets each)",
    competitor: "Competitor Analysis: Overview, Feature Comparison, Pricing, Market Gaps",
    pestle:     "PESTLE Analysis: Political, Economic, Social, Technological, Legal, Environmental",
    business:   "Business Report: Market Analysis, Financial Insights, Operational Recommendations",
    content:    "Content Brief: Target Keywords, Content Angles, Audience Personas, Calendar",
    meeting:    "Meeting Summary: Key Decisions, Action Items, Follow-up Questions",
    research:   "Research Summary: Key Findings, Data Quality, Research Gaps, Next Steps",
    strategy:   "Strategy Report: Current State, Goals, Strategic Options, Roadmap",
  };

  const personaDesc: Record<string, string> = {
    ceo:       "Write for a CEO. Concise, strategic, financial impact focus.",
    marketing: "Write for a Marketing Manager. Campaigns, audience, messaging.",
    sales:     "Write for a Sales Team. Competitive advantage, objection handling.",
    investor:  "Write for an Investor. Market size, growth potential, risks, metrics.",
    product:   "Write for a Product Manager. User needs, feature priorities.",
    writer:    "Write for a Content Writer. Narratives, keywords, content angles.",
  };

  const data = await callOpenAI(
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `Generate a ${reportDesc[reportType] || reportType} for a ${personaDesc[persona] || "professional"}.

Format in clean Markdown:
- ## section headers
- **bold** key findings
- Bullet points for lists
- > blockquotes for important quotes from documents
- *Source: filename* after key claims
- ⚠️ Data Gap: where info is missing
- End with ## Action Required section`,
        },
        { role: "user", content: `Documents:\n\n${docContext}` },
      ],
      temperature: 0.4,
      max_tokens: 2500,
    },
    apiKey
  );

  return data.choices[0]?.message?.content || "Report generation failed.";
}

/** Demo report — structured summary without API */
function demoReport(docs: UploadedDoc[], reportType: string, persona: string): string {
  const allTopics = [...new Set(docs.flatMap(d => d.topics))];
  const totalWords = docs.reduce((a, d) => a + d.wordCount, 0);
  const docList = docs.map(d => `- **${d.name}** — ${d.wordCount} words — Topics: ${d.topics.join(", ")}`).join("\n");
  const allText = docs.map(d => d.content).join(" ");
  const extracts = allText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 50 && !s.startsWith("["))
    .slice(0, 4);

  const typeName = reportType.charAt(0).toUpperCase() + reportType.slice(1).replace(/-/g, " ");

  return `# ${typeName} Report
*Persona: ${persona.toUpperCase()} · ${docs.length} document${docs.length !== 1 ? "s" : ""} analyzed · ${totalWords.toLocaleString()} words*

---

## Documents Analyzed

${docList}

## Key Topics Detected

${allTopics.map(t => `- **${t}**`).join("\n")}

## Document Summaries

${docs.map(d => `### ${d.name}\n${d.summary}`).join("\n\n")}

## Key Extracts

${extracts.map((e, i) => `> ${i + 1}. ${e}`).join("\n\n")}

## Data Coverage

| Metric | Value |
|--------|-------|
| Documents | ${docs.length} |
| Total words | ${totalWords.toLocaleString()} |
| Topics detected | ${allTopics.length} |
| Analysis mode | Demo (no AI) |

⚠️ **Data Gap:** This report was generated in **demo mode** without AI analysis.
Add your OpenAI API key in **Settings** and regenerate for a full AI report with insights,
evidence citations, and tailored recommendations.

## Action Required

1. Go to **Settings** → add your OpenAI API key
2. Return to **Reports** → click **Generate Report** again
3. You will receive a full AI-powered report with evidence scoring

---
*Generated by InsightFlow AI — Demo Mode*`;
}
