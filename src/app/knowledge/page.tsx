"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Upload, FileText, Globe, Hash, CheckCircle,
  Loader2, X, Tag, Trash2, AlertCircle, Zap, FileSearch,
  BarChart3, Clock, RefreshCw
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
  "Complete",
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, docx: FileText, txt: FileText,
  csv: Hash, json: Hash, md: FileText, url: Globe,
};

const TYPE_COLORS: Record<string, { t: string; b: string }> = {
  pdf:  { t: "text-red-400",     b: "bg-red-500/10" },
  docx: { t: "text-blue-400",    b: "bg-blue-500/10" },
  txt:  { t: "text-slate-400",   b: "bg-slate-500/10" },
  csv:  { t: "text-emerald-400", b: "bg-emerald-500/10" },
  json: { t: "text-amber-400",   b: "bg-amber-500/10" },
  md:   { t: "text-cyan-400",    b: "bg-cyan-500/10" },
  url:  { t: "text-violet-400",  b: "bg-violet-500/10" },
};

function fmtSize(b: number) {
  if (!b) return "";
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

type PFile = { name: string; step: number; progress: number; docId: string };

export default function KnowledgePage() {
  const {
    documents, addDocument, updateDocument, removeDocument,
    openaiKey,
  } = useAppStore();

  const [isDark, setIsDark] = useState(true);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState<PFile[]>([]);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const readyDocs = documents.filter(d => d.status === "ready");

  const filtered = readyDocs.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  // Process a single file: extract text → topics → summary → mark ready
  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Add placeholder
    const placeholder: UploadedDoc = {
      id: docId,
      name: file.name,
      type: ext,
      size: file.size,
      content: "",
      uploadedAt: new Date().toISOString(),
      status: "processing",
      topics: [],
      wordCount: 0,
      summary: "Processing...",
    };
    addDocument(placeholder);

    // Show progress steps
    const setStep = (step: number) => {
      setProcessing(prev => {
        const item: PFile = {
          name: file.name,
          step,
          progress: Math.round(((step + 1) / STEPS.length) * 100),
          docId,
        };
        const exists = prev.find(p => p.docId === docId);
        return exists
          ? prev.map(p => p.docId === docId ? item : p)
          : [...prev, item];
      });
    };

    try {
      setStep(0); // Reading file
      await new Promise(r => setTimeout(r, 200));

      setStep(1); // Extracting text
      const content = await extractTextFromFile(file);

      setStep(2); // Detecting topics
      await new Promise(r => setTimeout(r, 200));
      const topics = extractTopics(content);

      setStep(3); // Indexing
      await new Promise(r => setTimeout(r, 200));

      setStep(4); // Summary
      const summary = generateSummary(content);
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      // Save to store
      updateDocument(docId, { content, topics, summary, wordCount, status: "ready" });

      setStep(5); // Complete
      await new Promise(r => setTimeout(r, 400));

    } catch (err) {
      updateDocument(docId, { status: "error", summary: "Failed to parse file." });
      setError(`Could not read "${file.name}" — ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setProcessing(prev => prev.filter(p => p.docId !== docId));
    }
  }, [addDocument, updateDocument]);

  // Handle multiple files — process them one by one
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    for (const f of list) {
      await processFile(f);
    }
  }, [processFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    addDocument({
      id: `doc-url-${Date.now()}`,
      name: url,
      type: "url",
      size: 0,
      content: `Web resource: ${url}`,
      uploadedAt: new Date().toISOString(),
      status: "ready",
      topics: ["Web"],
      wordCount: 0,
      summary: `Linked resource: ${url}`,
    });
    setUrlInput("");
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Knowledge Base"
          subtitle={
            processing.length > 0
              ? `Processing ${processing.length} file${processing.length > 1 ? "s" : ""}...`
              : `${readyDocs.length} document${readyDocs.length !== 1 ? "s" : ""} indexed`
          }
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")} className="shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active processing bars */}
          <AnimatePresence>
            {processing.map(pf => (
              <motion.div
                key={pf.docId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />
                  <span className="text-sm font-medium text-violet-300 truncate flex-1">{pf.name}</span>
                  <span className="text-xs text-violet-400/60 shrink-0">{pf.progress}%</span>
                </div>
                <Progress value={pf.progress} colorClass="bg-violet-500" className="h-1.5 mb-1" />
                <p className="text-xs text-violet-400/60">{STEPS[pf.step]}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setDragging(false); }}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none",
              dragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-700 hover:border-violet-500/50 hover:bg-slate-900/40"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.docx,.txt,.csv,.json,.md,.xml"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                  // Reset input so same file can be re-uploaded
                  e.target.value = "";
                }
              }}
            />
            <Upload className={cn(
              "w-10 h-10 mx-auto mb-3 transition-colors",
              dragging ? "text-violet-400" : "text-slate-500"
            )} />
            <p className="text-base font-semibold text-slate-300 mb-1">
              {dragging ? "Drop files to upload" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-slate-500 mb-4">or click anywhere to browse</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PDF", "DOCX", "TXT", "CSV", "JSON", "MD"].map(t => (
                <span key={t} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-lg">{t}</span>
              ))}
            </div>
          </div>

          {/* URL input */}
          <div className="flex gap-2">
            <Input
              placeholder="Or paste a URL to add as a reference..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddUrl()}
              icon={<Globe className="w-4 h-4" />}
              className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
            <Button variant="secondary" onClick={handleAddUrl} disabled={!urlInput.trim()}>
              Add URL
            </Button>
          </div>

          {/* Empty state */}
          {documents.length === 0 && processing.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-1">No documents yet</p>
              <p className="text-slate-600 text-sm">
                Upload PDFs, Word docs, text files or CSVs — content is extracted and indexed instantly
              </p>
            </div>
          )}

          {/* Post-upload action banner */}
          {readyDocs.length > 0 && processing.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-300 mb-1">
                  {readyDocs.length} document{readyDocs.length !== 1 ? "s" : ""} ready
                </p>
                <p className="text-xs text-emerald-400/70 mb-3">
                  {openaiKey
                    ? "AI is active — go to any feature below to start analyzing"
                    : "Working in demo mode — add your OpenAI key in Settings for full AI"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/chat">
                    <Button size="sm" variant="gradient" className="h-7 text-xs">
                      <Zap className="w-3 h-3 mr-1" /> Ask AI
                    </Button>
                  </Link>
                  <Link href="/evidence">
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                      <FileSearch className="w-3 h-3 mr-1" /> Evidence Check
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                      <BarChart3 className="w-3 h-3 mr-1" /> Generate Report
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search bar */}
          {readyDocs.length > 0 && (
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by name or topic..."
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-sm bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              {search && (
                <span className="text-xs text-slate-500">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Documents grid */}
          {filtered.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((doc, i) => {
                const Icon = TYPE_ICONS[doc.type] || FileText;
                const c = TYPE_COLORS[doc.type] || { t: "text-slate-400", b: "bg-slate-500/10" };
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors group">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", c.b)}>
                            <Icon className={cn("w-5 h-5", c.t)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate" title={doc.name}>{doc.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="secondary" className="uppercase text-xs px-1.5 py-0">{doc.type}</Badge>
                              <Badge variant="success" className="text-xs">Ready</Badge>
                            </div>
                          </div>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            title="Remove document"
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-all shrink-0"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>

                        {doc.summary && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{doc.summary}</p>
                        )}

                        {doc.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {doc.topics.slice(0, 4).map(t => (
                              <span key={t} className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                <Tag className="w-2.5 h-2.5" />{t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(new Date(doc.uploadedAt))}
                          </span>
                          <div className="flex items-center gap-2">
                            {doc.wordCount > 0 && <span>{doc.wordCount.toLocaleString()} words</span>}
                            {doc.size > 0 && <span>{fmtSize(doc.size)}</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
