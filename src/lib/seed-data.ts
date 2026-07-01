/**
 * Preloaded demo data — seeds the store on first open so reviewers
 * see a working app immediately without needing to upload files.
 */
import type { UploadedDoc, EvidenceStatement, Report } from "./store";

export const SEED_DOCS: UploadedDoc[] = [
  {
    id: "demo-doc-1",
    name: "Q3 Market Research Report.txt",
    type: "txt",
    size: 12400,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "ready",
    wordCount: 1820,
    topics: ["Market Growth", "SaaS Trends", "Competitors", "Pricing", "Customer Segments"],
    summary:
      "Comprehensive Q3 analysis of the SaaS research tools market. Mid-market segment shows 67% of companies planning to increase AI tool spending. 12 new competitors entered H1 2024. Significant pricing gap exists in the $200–500/month tier.",
    content: `Q3 Market Research Report — SaaS Research Tools Sector

Executive Overview
This report covers findings from a survey of 1,200 mid-market decision makers conducted in September 2024.

Key Finding 1: Spending Intent
67% of mid-market companies (50–500 employees) plan to increase SaaS spending in Q4 2024, with AI-powered research tools listed as the top priority category. This represents a 23% increase from the same period in 2023.

Key Finding 2: Pricing Gap
Current market leaders (HubSpot Enterprise $1,200/mo, Salesforce $1,500/mo, Marketo $895/mo) are priced out of reach for most mid-market teams. 45% of survey respondents indicated a budget range of $200–500/month for research tooling. No major competitor currently occupies this tier.

Key Finding 3: AI Adoption
84% year-over-year increase in AI research tool adoption within B2B marketing teams in 2024, according to internal survey data. Teams report saving an average of 8.3 hours per week when AI research tools are used.

Key Finding 4: Competitive Landscape
12 new AI research tools entered the market in H1 2024, primarily targeting the enterprise segment ($2,000+/mo). The mid-market remains underserved. Top three pain points cited by respondents: (1) scattered research across multiple tools 78%, (2) lack of evidence verification 71%, (3) slow report generation 65%.

Key Finding 5: Content Team Needs
78% of marketing teams are actively looking for AI research tools to replace manual workflows. Current manual research-to-output cycle averages 14 hours. Teams want: automatic summaries, source citations, and editable outputs.

Data Notes
Sample size: 1,200. Margin of error: ±3.2%. Survey conducted via email panel September 1–15, 2024. Industry segments represented: SaaS 34%, Professional Services 28%, Media 18%, Other 20%.`,
  },
  {
    id: "demo-doc-2",
    name: "Competitor Analysis — HubSpot vs Notion AI.txt",
    type: "txt",
    size: 8700,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "ready",
    wordCount: 1140,
    topics: ["HubSpot", "Notion AI", "Pricing", "Features", "Market Position"],
    summary:
      "Side-by-side analysis of HubSpot and Notion AI as competitors. HubSpot Enterprise starts at $1,200/mo. Notion AI adds $10/user/mo. Neither offers evidence verification or confidence scoring.",
    content: `Competitor Analysis: HubSpot vs Notion AI
Prepared: October 2024

HubSpot Enterprise
Pricing: $1,200/month (minimum 10 users)
Key features: CRM integration, marketing automation, basic AI content tools, reporting dashboards
AI capabilities: Content generation, email subject line suggestions, basic summarisation
Limitations: No evidence verification, no source citations, no confidence scoring, no research-specific workflow
Target customer: Mid-to-large enterprises with dedicated sales/marketing ops teams
Market position: Market leader in CRM-attached marketing tools

Notion AI
Pricing: $16/user/month (AI add-on, $10/user base)
Key features: Note-taking, database management, AI writing assistant
AI capabilities: Page summarisation, Q&A over workspace content, draft generation
Limitations: No evidence checking, no confidence scores, no report approval workflow, weak document ingestion
Target customer: Knowledge workers, product teams, startups
Market position: Strong in productivity; weak in structured business intelligence

Key Competitive Gap
Neither HubSpot nor Notion AI offer:
- Evidence verification (Supported / Unsupported ratings per claim)
- Confidence scores on AI outputs
- Human approval workflow before export
- Weak claim detection with source references
- Multi-document contradiction detection

This represents a clear differentiation opportunity for tools that prioritise evidence quality over raw output speed.

Pricing comparison at $200–500/month tier: No major competitor has a product here. Closest is Notion AI at ~$26/user/month, but it lacks research-specific features.`,
  },
  {
    id: "demo-doc-3",
    name: "Customer Interviews — October 2024.txt",
    type: "txt",
    size: 6200,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "ready",
    wordCount: 890,
    topics: ["Customer Pain Points", "Feature Requests", "Workflow", "Trust", "AI Adoption"],
    summary:
      "Qualitative findings from 12 interviews with marketing managers and business analysts. Primary pain: lack of trust in AI outputs. All 12 want evidence sources. 9 of 12 want human approval before reports are shared.",
    content: `Customer Discovery Interviews — October 2024
12 interviews conducted with marketing managers and business analysts at mid-market SaaS companies.

Common Pain Points (mentioned by 8+ interviewees)
1. "I copy-paste from ChatGPT into a Google Doc, then manually check every fact. It takes hours." — Marketing Manager, Series B SaaS
2. "I don't trust AI summaries because I don't know what they're based on." — Business Analyst, Consulting
3. "We had an embarrassing moment where an AI-generated report cited a statistic that was completely wrong. We need to see the sources." — Content Director, Media Company
4. "Reports go through 3 people before they leave the company. I need something that has an approval step built in." — Head of Marketing, FinTech startup

Feature Requests (unprompted)
- Show me where each claim comes from (12/12)
- Tell me which parts the AI is uncertain about (11/12)
- Don't let anyone export a report without someone approving it (9/12)
- Flag when two documents say different things (8/12)
- Give me the output tailored to who's reading it (7/12)

Trust Is the Core Issue
Interviewee consensus: AI tools are fast but untrustworthy. Teams want speed AND evidence. Current tools make them choose one.

Willingness to Pay
Average stated willingness: $280–420/month for a tool that provides evidence-backed AI research outputs. 10/12 would replace their current tool combination (ChatGPT + Google Docs + Notion) with one product that did it reliably.`,
  },
];

export const SEED_EVIDENCE: EvidenceStatement[] = [
  {
    id: "demo-ev-1",
    text: "67% of mid-market companies plan to increase SaaS spending in Q4 2024, with AI tools as the top priority.",
    status: "supported",
    confidence: 91,
    sourceDoc: "Q3 Market Research Report.txt",
    excerpt: "67% of mid-market companies (50–500 employees) plan to increase SaaS spending in Q4 2024, with AI-powered research tools listed as the top priority category.",
    reasoning: "Directly stated with sample size (1,200) and methodology disclosed. Strong primary source evidence.",
  },
  {
    id: "demo-ev-2",
    text: "No major competitor occupies the $200–500/month pricing tier for research tools.",
    status: "supported",
    confidence: 84,
    sourceDoc: "Competitor Analysis — HubSpot vs Notion AI.txt",
    excerpt: "Pricing comparison at $200–500/month tier: No major competitor has a product here.",
    reasoning: "Corroborated by both the market research report and the competitor analysis. Consistent across two independent documents.",
  },
  {
    id: "demo-ev-3",
    text: "Teams save an average of 8.3 hours per week using AI research tools.",
    status: "partial",
    confidence: 62,
    sourceDoc: "Q3 Market Research Report.txt",
    excerpt: "Teams report saving an average of 8.3 hours per week when AI research tools are used.",
    reasoning: "Self-reported figure from the same survey. No independent validation. Could reflect optimism bias in survey responses.",
  },
  {
    id: "demo-ev-4",
    text: "78% of marketing teams are actively looking for AI research tools.",
    status: "partial",
    confidence: 68,
    sourceDoc: "Q3 Market Research Report.txt",
    excerpt: "78% of marketing teams are actively looking for AI research tools to replace manual workflows.",
    reasoning: "From internal survey. Customer interviews suggest this number may be correct but adoption intent does not equal purchasing intent.",
  },
  {
    id: "demo-ev-5",
    text: "All 12 interviewees want AI outputs to show source citations.",
    status: "supported",
    confidence: 95,
    sourceDoc: "Customer Interviews — October 2024.txt",
    excerpt: "Show me where each claim comes from (12/12)",
    reasoning: "Unanimous across all 12 interviews. Highest-confidence finding in the qualitative research.",
  },
  {
    id: "demo-ev-6",
    text: "AI tool adoption in SaaS marketing grew 84% year-over-year in 2024.",
    status: "partial",
    confidence: 55,
    sourceDoc: "Q3 Market Research Report.txt",
    excerpt: "84% year-over-year increase in AI research tool adoption within B2B marketing teams in 2024, according to internal survey data.",
    reasoning: "Sourced from 'internal survey data' — not independently verified. Definition of 'adoption' is unclear. Treat as directional indicator only.",
  },
  {
    id: "demo-ev-7",
    text: "HubSpot Enterprise pricing starts at $1,200/month minimum.",
    status: "supported",
    confidence: 88,
    sourceDoc: "Competitor Analysis — HubSpot vs Notion AI.txt",
    excerpt: "HubSpot Enterprise: Pricing: $1,200/month (minimum 10 users)",
    reasoning: "Specific pricing figure stated in competitor analysis. Should be verified against current HubSpot pricing page before use in external reports.",
  },
  {
    id: "demo-ev-8",
    text: "Customer willingness to pay averages $280–420/month for evidence-backed AI research tools.",
    status: "unsupported",
    confidence: 38,
    sourceDoc: "Customer Interviews — October 2024.txt",
    excerpt: "Average stated willingness: $280–420/month for a tool that provides evidence-backed AI research outputs.",
    reasoning: "Based on 12 interviews only — very small sample. Stated willingness-to-pay in interviews consistently overestimates actual purchase behaviour. Needs validation with a larger pricing study.",
  },
];

export const SEED_REPORT: Report = {
  id: "demo-report-1",
  title: "Executive Summary — Q4 Market Opportunity",
  type: "executive",
  persona: "ceo",
  status: "review",
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  workspaceId: "ws-default",
  content: `# Executive Summary — Q4 Market Opportunity
*Prepared for: CEO | Confidence: 78% | Sources: 3 documents*

---

## Situation

Your research documents reveal a **clear and immediate market opportunity** in the AI research tools space for mid-market companies (50–500 employees). Current market leaders are priced out of this segment, and customer demand is confirmed.

## Key Findings

**1. Validated Demand**
- 67% of mid-market companies plan to increase AI tool spending in Q4 2024 *(Source: Q3 Market Research Report — 91% confidence)*
- 78% of marketing teams actively seeking AI research tools *(Source: Q3 Market Research Report — 68% confidence)*
- 12/12 interviewed customers want evidence-backed outputs with source citations *(Source: Customer Interviews — 95% confidence)*

**2. Pricing Gap Confirmed**
No major competitor occupies the $200–500/month tier. HubSpot starts at $1,200/month. Notion AI lacks research-specific features. *(Source: Competitor Analysis — 84% confidence)*

**3. Trust Is the Differentiator**
Customer interviews reveal that AI tool distrust — not lack of features — is the primary adoption barrier. Teams want speed AND evidence. Current tools force a choice between the two.

## Risks

> ⚠ Willingness-to-pay data ($280–420/month) is based on only 12 interviews — **low confidence (38%)**. A pricing study with 100+ respondents is recommended before committing to a pricing strategy.

> ⚠ The 8.3 hours/week savings figure is self-reported and unvalidated — treat as directional only.

## Recommended Actions

1. **Proceed with Q4 launch targeting mid-market** — demand signal is strong and validated across two independent sources
2. **Price at $249–349/month** — sits in the confirmed gap, below all major competitors
3. **Run a 50-person pricing study** before finalising — current data confidence too low for pricing decisions
4. **Lead with evidence and trust** — not speed — in all marketing messaging

---

## Human Review Required

This report is **awaiting approval** before it can be shared or exported.

⚠ Reviewer: Please verify the HubSpot pricing figure against their current website before approving — pricing may have changed since October 2024.

*Generated by InsightFlow AI — Demo Report*`,
};
