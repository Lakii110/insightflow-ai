export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "csv" | "url" | "text" | "youtube" | "image";
  size?: number;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  summary?: string;
  topics?: string[];
  wordCount?: number;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  documents: Document[];
  status: "active" | "archived";
  healthScore?: number;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  evidence?: EvidenceSource[];
  weaknesses?: string[];
  contradictions?: string[];
  missingInfo?: string[];
  nextQuestion?: string;
}

export interface EvidenceSource {
  documentId: string;
  documentName: string;
  excerpt: string;
  pageNumber?: number;
  confidence: number;
}

export interface InsightCard {
  id: string;
  type: "trend" | "risk" | "opportunity" | "contradiction" | "missing" | "action";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  businessImpact: "high" | "medium" | "low";
  evidence: string[];
  createdAt: Date;
}

export interface Report {
  id: string;
  type: "executive" | "marketing" | "business" | "competitor" | "swot" | "pestle" | "content" | "meeting" | "strategy" | "research";
  persona: "ceo" | "marketing" | "sales" | "investor" | "product" | "writer";
  title: string;
  content: string;
  status: "draft" | "review" | "approved" | "exported";
  createdAt: Date;
  workspaceId: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "topic" | "document" | "insight" | "entity" | "opportunity" | "trend";
  x: number;
  y: number;
  connections: string[];
  evidence?: EvidenceSource[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "done" | "error";
  progress?: number;
}

export interface ResearchHealthScore {
  overall: number;
  coverage: number;
  confidence: number;
  bias: number;
  missingSources: number;
  evidenceStrength: number;
  completeness: number;
}
