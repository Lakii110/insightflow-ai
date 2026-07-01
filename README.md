# InsightFlow AI
### Research → Evidence → Decisions

> Built for the **Catalist Media Agent Prototyping Intern Builder Challenge — Option 3**

InsightFlow AI is a premium SaaS-quality AI research workspace that transforms messy research documents into trustworthy, evidence-backed business decisions — with full human review before any output is exported.

---

## What Problem Does It Solve?

Modern teams waste hours switching between ChatGPT, Google Docs, Notion, and spreadsheets trying to make sense of scattered research. InsightFlow solves this by:

1. **Centralising** all research in one workspace (PDFs, DOCX, TXT, CSV, URLs)
2. **Analyzing** documents with AI — extracting topics, key facts, and relationships
3. **Verifying** every AI claim with an evidence checker (Supported / Partial / Unsupported)
4. **Generating** business-ready reports tailored to persona (CEO, Marketing, Investor, etc.)
5. **Requiring human approval** before any report is exported — responsible AI by design

---

## Live Demo Flow

```
Upload Research  →  AI Processing  →  Evidence Mapping  →  Review  →  Export
     ↓                   ↓                   ↓               ↓           ↓
  PDF/DOCX/TXT      Extract text         Check claims     Human OK    Report
  CSV/JSON/MD       Find topics          Flag weak ones   Edit/Approve Copy/Save
```

### Sample Cases

**Case 1 — Marketing Research**
- Input: 5 marketing articles + competitor PDFs
- Output: Marketing Report (Confidence 87%) with evidence citations
- Flags: 2 unsupported claims, missing competitor pricing data

**Case 2 — Meeting Notes**
- Input: Meeting notes TXT file
- Output: Executive Summary for CEO persona
- Flags: Missing budget information, 3 action items require human verification

**Case 3 — Research PDF**
- Input: Industry research PDF
- Output: SWOT Analysis with weak evidence detection
- Flags: ⚠ Low confidence on market size claim — human approval required before export

---

## Key Features

| Feature | Description |
|---------|-------------|
| 📁 Document Upload | Drag & drop PDF, DOCX, TXT, CSV, JSON, MD — real text extraction |
| 🤖 AI Chat | Ask questions, get answers with confidence scores + source citations |
| 🛡 Evidence Checker | Every AI claim rated: Supported / Partially Supported / Unsupported |
| 📊 Report Generator | 9 report types × 6 personas — Executive, SWOT, Marketing, PESTLE and more |
| 🔍 Research Graph | Visual knowledge map of topics and document relationships |
| 👤 Human Review | Draft → Review → Approve → Export workflow — nothing ships without approval |
| ⚠ Weak Claim Detection | Flags low-confidence AI statements with reasoning |
| 💾 Persistent Store | All documents, chats, and reports saved in browser (Zustand + localStorage) |

---

## AI Workflow

```
1. Upload Documents
   └── Text extracted (PDF.js, Mammoth for DOCX, native for TXT/CSV)
   └── Topics detected via keyword frequency
   └── Summary generated from first meaningful sentences

2. AI Analysis (OpenAI GPT-4o-mini)
   └── Evidence-backed answers with confidence scores
   └── Source citations with exact quotes
   └── Weak evidence warnings
   └── Contradiction detection between documents
   └── Missing information flags

3. Evidence Check
   └── AI audits every factual claim
   └── Each statement rated: Supported / Partial / Unsupported
   └── Expandable cards show source excerpt + reasoning

4. Report Generation
   └── 9 report types: Executive Summary, SWOT, Marketing, Competitor, PESTLE, etc.
   └── 6 personas: CEO, Marketing Manager, Sales, Investor, Product Manager, Writer
   └── Each report tailored to audience priorities

5. Human Review
   └── Draft → Submit for Review → Approve → Export
   └── No report can be exported without human approval
   └── Approver can edit before approving
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | TailwindCSS v4, Framer Motion |
| State | Zustand (persisted to localStorage) |
| AI | OpenAI API (GPT-4o-mini), RAG pattern |
| File Parsing | PDF.js (PDF), Mammoth (DOCX), native (TXT/CSV) |
| UI Components | Custom components + Radix UI primitives |

---

## Installation & Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/insightflow
cd insightflow

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Add Your OpenAI API Key

1. Open the app → go to **Settings** (sidebar)
2. Paste your OpenAI API key (`sk-proj-...`)
3. Click **Save API Key**
4. All AI features activate immediately

> Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
> Recommended model: **gpt-4o-mini** (fast + affordable)

> **Security note:** Your API key is stored only in your browser's localStorage. It is never sent to any server other than OpenAI directly.

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with workflow overview |
| `/dashboard` | Overview — stats, recent docs, quick upload |
| `/knowledge` | Upload & manage documents |
| `/documents` | Document detail view with content preview |
| `/chat` | AI Chat with evidence panel |
| `/evidence` | Evidence checker — claim verification |
| `/reports` | Generate & approve business reports |
| `/graph` | Visual research knowledge graph |
| `/exports` | Export approved reports |
| `/workspace` | Workspace management |
| `/settings` | API key + preferences |

---

## Security & Responsible AI

- ✅ API keys stored in browser only — never on server
- ✅ No permanent document storage — all local
- ✅ Human approval required before any report is exported
- ✅ Every AI output shows confidence score + sources
- ✅ Weak claims flagged before reaching the user
- ✅ Contradictions between documents surfaced automatically

---

## Assignment Alignment — Option 3

This project directly addresses the Option 3 brief:

> *"Build an AI agent that processes business research and generates structured, evidence-backed outputs."*

| Requirement | Implementation |
|-------------|---------------|
| Upload multiple document types | ✅ PDF, DOCX, TXT, CSV, JSON, MD |
| AI analysis pipeline | ✅ Extract → Chunk → Analyze → Verify → Generate |
| Evidence verification | ✅ Evidence Checker with Supported/Partial/Unsupported |
| Weak claim detection | ✅ Every AI statement flagged with confidence |
| Human review before export | ✅ Draft → Review → Approve → Export workflow |
| Business-ready outputs | ✅ 9 report types × 6 personas |
| Premium UI/UX | ✅ Notion + Linear + Perplexity aesthetic |

---

*Built by [Your Name] — Catalist Media Agent Prototyping Intern Builder Challenge 2024*
