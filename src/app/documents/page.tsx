"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Upload, Search, Trash2, Tag, Hash, Globe, Eye,
  CheckCircle, AlertCircle, Loader2, X, Clock, FileSearch,
  ChevronRight, BookOpen, Zap
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { extractTextFromFile, extractTopics, generateSummary } from "@/lib/file-parser";
import type { UploadedDoc } from "@/lib/store";
import { cn, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

const STEPS = [
  "Reading file",
  "Extracting text",
  "Detecting topics",
  "Indexing content",
  "Generating summary",
  "Ready",
];

const typeIcon: Record<string, React.ElementType> = {
  pdf: FileText, docx: FileText, txt: FileText,
  csv: Hash, json: Hash, md: FileText, url: Globe,
};
const typeColor: Record<string, string> = {
  pdf: "text-red-400 bg-red-500/10 border-red-500/20",
  docx: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  txt: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  csv: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  json: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  md: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  url: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

function formatSize(b: number) {
  if (!b) return "";
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1048576).toFixed(1)}MB`;
}

type ProcessingFile = { name: string; step: number; progress: number; docId: string };

export default function DocumentsPage() {
  const { documents, addDocument, updateDocument, removeDocument, openaiKey } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState<ProcessingFile[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UploadedDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    addDocument({
      id: docId, name: file.name, type: ext, size: file.size,
      content: "", uploadedAt: new Date().toISOString(), status: "processing",
      topics: [], wordCount: 0, summary: "Processing...",
    });

    const update = (step: number) => {
      setProcessing(prev => {
        const exists = prev.find(p => p.docId === docId);
        const item = { name: file.name, step, progress: Math.round((step / STEPS.length) * 100), docId };
        return exists ? prev.map(p => p.docId === docId ? item : p) : [...prev, item];
      });
    };

    for (let i = 0; i < STEPS.length - 1; i++) {
      update(i);
      if (i === 1) {
        // Real work happens here
        try {
          const content = await extractTextFromFile(file);
          const topics = extractTopics(content);
          const summary = generateSummary(content);
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          updateDocument(docId, { content, topics, summary, wordCount });
        } catch (e) {
          updateDocument(docId, { status: "error", summary: "Could not parse file." });
          setProcessing(prev => prev.filter(p => p.docId !== docId));
          setError(`Failed to read ${file.name}`);
          return;
        }
      }
      await new Promise(r => setTimeout(r, 350));
    }

    update(STEPS.length - 1);
    updateDocument(docId, { status: "ready" });
    await new Promise(r => setTimeout(r, 300));
    setProcessing(prev => prev.filter(p => p.docId !== docId));
  }, [addDocument, updateDocument]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError("");
    for (const f of Array.from(files)) {
      await processFile(f);
    }
  }, [processFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Documents"
          subtitle={`${documents.filter(d => d.status === "ready").length} of ${documents.length} ready`}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          actions={
            <Button size="sm" variant="gradient" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload
            </Button>
          }
        />

        <input
          ref={fileRef} type="file" multiple className="hidden"
          accept=".pdf,.docx,.txt,.csv,.json,.md,.xml"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* LEFT: Documents list */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 space-y-3">
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing cards */}
              <AnimatePresence>
                {processing.map(pf => (
                  <motion.div key={pf.docId}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />
                      <span className="text-xs font-medium text-violet-300 truncate flex-1">{pf.name}</span>
                      <span className="text-xs text-violet-400/60 shrink-0">{pf.progress}%</span>
                    </div>
                    <Progress value={pf.progress} colorClass="bg-violet-500" className="h-1 mb-1" />
                    <p className="text-xs text-violet-400/60">{STEPS[pf.step]}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Search + Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-3",
                  dragging ? "border-violet-500 bg-violet-500/10" : "border-slate-700 hover:border-violet-500/40 hover:bg-slate-900/50"
                )}
              >
                <Upload className={cn("w-5 h-5 shrink-0", dragging ? "text-violet-400" : "text-slate-500")} />
                <div className="text-left">
                  <p className="text-sm text-slate-400">{dragging ? "Drop files to upload" : "Drag & drop files here, or click to browse"}</p>
                  <p className="text-xs text-slate-600 mt-0.5">PDF, DOCX, TXT, CSV, JSON, MD supported</p>
                </div>
              </div>

              {documents.length > 0 && (
                <Input
                  placeholder="Search documents..."
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              )}
            </div>

            {/* Document list */}
            <div className="flex-1 overflow-y-auto p-4">
              {documents.length === 0 && processing.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium mb-2">No documents yet</p>
                  <p className="text-slate-600 text-sm mb-6 max-w-xs">Upload your research documents to start getting AI-powered insights, evidence checks, and reports.</p>
                  <Button variant="gradient" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Upload Your First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((doc, i) => {
                    const Icon = typeIcon[doc.type] || FileText;
                    const colors = (typeColor[doc.type] || "text-slate-400 bg-slate-500/10 border-slate-500/20").split(" ");
                    const isSelected = selected?.id === doc.id;

                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(isSelected ? null : doc)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group",
                          isSelected ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", colors[1], colors[2])}>
                          <Icon className={cn("w-4.5 h-4.5", colors[0])} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {doc.status === "ready" && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Ready</span>}
                            {doc.status === "processing" && <span className="text-xs text-violet-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Processing</span>}
                            {doc.status === "error" && <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Error</span>}
                            {doc.wordCount > 0 && <span className="text-xs text-slate-600">{doc.wordCount.toLocaleString()} words</span>}
                            {doc.size > 0 && <span className="text-xs text-slate-600">{formatSize(doc.size)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(doc); }}
                            className="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); removeDocument(doc.id); if (selected?.id === doc.id) setSelected(null); }}
                            className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-l border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm truncate flex-1">{selected.name}</h3>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center shrink-0 ml-2">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Status */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Type", value: selected.type.toUpperCase() },
                      { label: "Size", value: formatSize(selected.size) || "—" },
                      { label: "Words", value: selected.wordCount > 0 ? selected.wordCount.toLocaleString() : "—" },
                      { label: "Uploaded", value: formatTimeAgo(new Date(selected.uploadedAt)) },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {selected.summary && selected.summary !== "Processing..." && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Summary</p>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
                        {selected.summary}
                      </p>
                    </div>
                  )}

                  {/* Topics */}
                  {selected.topics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.topics.map(t => (
                          <span key={t} className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 border border-slate-700/50 px-2.5 py-1 rounded-full">
                            <Tag className="w-3 h-3 text-violet-400" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content preview */}
                  {selected.content && !selected.content.startsWith("[") && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content Preview</p>
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-48 overflow-y-auto">
                        <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
                          {selected.content.slice(0, 800)}{selected.content.length > 800 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {selected.status === "ready" && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</p>
                      <Link href="/chat">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer group">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">Ask AI about this doc</p>
                            <p className="text-xs text-slate-500">Get evidence-backed answers</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </div>
                      </Link>
                      <Link href="/evidence">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group mt-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <FileSearch className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">Run evidence check</p>
                            <p className="text-xs text-slate-500">Verify all claims</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
