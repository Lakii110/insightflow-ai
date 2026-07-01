# InsightFlow AI — Submission Document
**Catalist Media | Agent Prototyping Intern Builder Challenge**
**Option 3: AI Research-to-Output Agent**

---

## Which Problem I Chose

Option 3 — AI Research-to-Output Agent.

Content, marketing, and business teams spend hours reading documents, switching between tools, and manually summarising research before they can make decisions or create outputs. I built a prototype that solves this end-to-end.

---

## Who the User Is

Marketing managers, business analysts, content teams, startup founders, and consultants who regularly need to process PDFs, reports, meeting notes, competitor documents, or raw research — and turn them into actionable outputs quickly. They currently waste time copy-pasting between ChatGPT, Google Docs, and Notion with no structure or evidence trail.

---

## What I Built

**InsightFlow AI** — a web application that takes uploaded research documents and runs them through an evidence-based AI pipeline, producing reports, summaries, and recommendations that require human approval before they can be exported.

Built as a Next.js web app running locally. No backend server required — the user provides their own OpenAI API key in Settings, which is stored only in their browser.

---

## Tools Used

- **Next.js 16 + TypeScript** — web framework
- **OpenAI API (GPT-4o-mini)** — AI processing
- **Zustand** — state management (persisted to localStorage)
- **PDF.js + Mammoth** — real text extraction from PDF and DOCX files
- **TailwindCSS + Framer Motion** — UI and animations
- **Kiro (AI coding assistant)** — used to help build and iterate on the prototype

---

## How the Workflow Works (Step by Step)

1. **Upload** — User drags and drops PDF, DOCX, TXT, CSV, or JSON files onto the Knowledge Base page. Text is extracted immediately in the browser using PDF.js and Mammoth.

2. **Index** — Topics are detected automatically via keyword frequency. A summary is generated from the first meaningful sentences.

3. **Ask AI** — User goes to AI Chat, asks a question. The app sends the full document content to OpenAI with a strict prompt requiring: an answer, confidence score (0–100%), evidence sources with exact quotes, weak evidence warnings, contradictions between documents, missing information flags, and a suggested follow-up question.

4. **Evidence Check** — The Evidence Checker page runs automatically when documents are loaded. It extracts 6–10 factual claims from the documents and rates each one: Supported, Partially Supported, or Unsupported — with source excerpts and reasoning.

5. **Generate Report** — User selects a report type (Executive Summary, SWOT, Marketing Report, Competitor Analysis, PESTLE, Content Brief, Meeting Summary, etc.) and a persona (CEO, Marketing Manager, Sales, Investor, Product Manager, Content Writer). OpenAI generates a Markdown report tailored to that audience.

6. **Human Review** — The report enters a Draft → Review → Approve → Export workflow. Nothing can be copied or exported until a human clicks Approve. This is enforced in the UI.

7. **Export** — Approved reports can be copied to clipboard or downloaded.

---

## Three Sample Inputs and Outputs

**Sample 1 — Marketing Research**
- Input: Upload a PDF or TXT containing market research data
- Output: Marketing Report with confidence score, evidence citations, and ⚠ flags for any unsupported claims
- Example flag: "Market size figure of $4.2B is mentioned once with no cited source — weak evidence"

**Sample 2 — Meeting Notes**
- Input: Paste or upload a TXT file of meeting notes
- Output: Executive Summary (CEO persona) with key decisions, action items, and ⚠ "Missing: budget approval not documented"
- Human review required before sharing

**Sample 3 — Competitor PDF**
- Input: Upload a competitor analysis PDF
- Output: SWOT Analysis with confidence 71% — flags "Pricing data is estimated, not confirmed" and "Only one document supports the market share claim"
- Cannot be exported until reviewer approves

---

## What Could Go Wrong

**Incorrect AI answers** — GPT-4o-mini can hallucinate even when given documents. Mitigation: every answer shows a confidence score and evidence quotes so the human reviewer can verify before approving.

**Privacy issues** — Document content is sent to OpenAI's API. Users should not upload confidential or personally identifiable information unless they have reviewed OpenAI's data usage policy. The app stores nothing permanently — all data is in the browser's localStorage only.

**When AI should not respond automatically** — The app never auto-exports anything. All reports require human approval. If confidence is below 60%, a warning is shown. Contradictions between documents are always surfaced to the reviewer.

**Poor quality inputs** — Scanned PDFs without text layers return no extractable content. Short or vague documents produce low-confidence outputs. The app flags this clearly.

---

## How I Would Test and Improve with More Time

- Test with real marketing teams using their actual research documents
- Add a proper vector database (Supabase pgvector) for semantic search across many documents
- Add URL scraping so web pages can be ingested directly
- Implement a contradiction resolver that lets the user pick which source to trust
- Add Slack / email notifications when a report is ready for review
- Write automated tests for the evidence checker accuracy

---

## AI Tools Used

- **Kiro** (AI coding assistant) — used throughout to build, debug, and iterate on the Next.js application
- **OpenAI GPT-4o-mini** — powers the in-app AI analysis, evidence checking, and report generation at runtime

---

*Word count: ~670 words*
