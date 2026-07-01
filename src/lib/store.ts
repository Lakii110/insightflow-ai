import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_DOCS, SEED_EVIDENCE, SEED_REPORT } from "./seed-data";

export interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // extracted text
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  topics: string[];
  wordCount: number;
  summary: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
  tags: string[];
  healthScore: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  confidence?: number;
  evidenceSources?: { docName: string; excerpt: string; confidence: number }[];
  weaknesses?: string[];
  contradictions?: string[];
  missingInfo?: string[];
  nextQuestion?: string;
}

export interface EvidenceStatement {
  id: string;
  text: string;
  status: "supported" | "partial" | "unsupported";
  confidence: number;
  sourceDoc: string;
  excerpt: string;
  reasoning: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  persona: string;
  content: string;
  status: "draft" | "review" | "approved";
  createdAt: string;
  workspaceId: string;
}

interface AppState {
  // Settings
  openaiKey: string;
  setOpenaiKey: (key: string) => void;

  // Documents
  documents: UploadedDoc[];
  addDocument: (doc: UploadedDoc) => void;
  updateDocument: (id: string, updates: Partial<UploadedDoc>) => void;
  removeDocument: (id: string) => void;

  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  addWorkspace: (ws: Workspace) => void;
  setActiveWorkspace: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Evidence
  evidenceStatements: EvidenceStatement[];
  setEvidenceStatements: (stmts: EvidenceStatement[]) => void;

  // Reports
  reports: Report[];
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;

  // Processing state
  isProcessing: boolean;
  processingStep: string;
  processingProgress: number;
  setProcessing: (val: boolean, step?: string, progress?: number) => void;

  // Demo reset
  resetToDemo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      openaiKey: "",
      setOpenaiKey: (key) => set({ openaiKey: key }),

      documents: SEED_DOCS,
      addDocument: (doc) => set((s) => ({
        documents: [...s.documents, doc],
      })),
      updateDocument: (id, updates) =>
        set((s) => ({ documents: s.documents.map((d) => d.id === id ? { ...d, ...updates } : d) })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      workspaces: [
        {
          id: "ws-default",
          name: "My Research",
          description: "Default workspace for uploaded documents",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documentIds: [],
          tags: ["research"],
          healthScore: 0,
        }
      ],
      activeWorkspaceId: "ws-default",
      addWorkspace: (ws) => set((s) => ({ workspaces: [...s.workspaces, ws] })),
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      chatMessages: [],
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      evidenceStatements: SEED_EVIDENCE,
      setEvidenceStatements: (stmts) => set({ evidenceStatements: stmts }),

      reports: [SEED_REPORT],
      addReport: (report) => set((s) => ({ reports: [...s.reports, report] })),
      updateReport: (id, updates) =>
        set((s) => ({ reports: s.reports.map((r) => r.id === id ? { ...r, ...updates } : r) })),

      isProcessing: false,
      processingStep: "",
      processingProgress: 0,
      setProcessing: (val, step = "", progress = 0) =>
        set({ isProcessing: val, processingStep: step, processingProgress: progress }),

      resetToDemo: () =>
        set({
          documents: SEED_DOCS,
          evidenceStatements: SEED_EVIDENCE,
          reports: [SEED_REPORT],
          chatMessages: [],
        }),
    }),
    { name: "insightflow-storage" }
  )
);
