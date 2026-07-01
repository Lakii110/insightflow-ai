"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Zap, BarChart3, Activity, Upload, FolderOpen, Plus,
  Clock, ArrowUpRight, Brain, Shield, Settings, ChevronRight
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { cn, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { useRef, useCallback } from "react";
import { extractTextFromFile, extractTopics, generateSummary } from "@/lib/file-parser";
import type { UploadedDoc } from "@/lib/store";

export default function DashboardPage() {
  const { documents, chatMessages, reports, evidenceStatements, openaiKey, addDocument, updateDocument, resetToDemo } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readyDocs = documents.filter(d => d.status === "ready");
  const healthScore = readyDocs.length > 0
    ? Math.min(100, Math.round(60 + (readyDocs.length * 5) + (reports.length * 3)))
    : 0;

  const stats = [
    { label: "Documents", value: String(documents.length), icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10", prog: Math.min(100, documents.length * 10), delta: `${readyDocs.length} ready` },
    { label: "AI Queries", value: String(chatMessages.filter(m => m.role === "user").length), icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10", prog: 70, delta: "Total questions asked" },
    { label: "Reports", value: String(reports.length), icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", prog: Math.min(100, reports.length * 15), delta: `${reports.filter(r => r.status === "approved").length} approved` },
    { label: "Health Score", value: healthScore > 0 ? `${healthScore}%` : "—", icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10", prog: healthScore, delta: healthScore > 0 ? "Research quality" : "Upload docs first" },
  ];

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
      const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const placeholder: UploadedDoc = {
        id: docId, name: file.name, type: ext, size: file.size,
        content: "", uploadedAt: new Date().toISOString(), status: "processing",
        topics: [], wordCount: 0, summary: "Processing...",
      };
      addDocument(placeholder);
      try {
        const content = await extractTextFromFile(file);
        const topics = extractTopics(content);
        const summary = generateSummary(content);
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        updateDocument(docId, { content, topics, summary, wordCount, status: "ready" });
      } catch {
        updateDocument(docId, { status: "error", summary: "Failed to parse." });
      }
    }
    setUploading(false);
  }, [addDocument, updateDocument]);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Dashboard"
          subtitle="Your research command center"
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          actions={
            <Link href="/workspace">
              <Button size="sm" variant="gradient"><Plus className="w-4 h-4" /> New Workspace</Button>
            </Link>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* API Key prompt */}
          {!openaiKey && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 flex items-center gap-3"
            >
              <Settings className="w-4 h-4 text-violet-400 shrink-0" />
              <p className="text-sm text-violet-300 flex-1">
                Add your OpenAI API key to unlock AI Chat, Evidence Checker, and Reports.
              </p>
              <Link href="/settings"><Button size="sm" variant="gradient">Add API Key</Button></Link>
            </motion.div>
          )}

          {/* Demo data banner */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-3"
          >
            <Brain className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-sm text-cyan-300 flex-1">
              Demo data loaded — 3 sample research documents ready to explore.
            </p>
            <Button size="sm" variant="secondary" onClick={resetToDemo} className="shrink-0 text-xs">
              Reset Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.bg)}>
                        <s.icon className={cn("w-4.5 h-4.5", s.color)} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
                    <div className="text-xs text-slate-500 mb-3">{s.label}</div>
                    <Progress value={s.prog} className="h-1" />
                    <p className="text-xs text-slate-500 mt-2">{s.delta}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Recent Documents</h2>
                <Link href="/knowledge">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {documents.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-1">No documents yet</p>
                    <p className="text-slate-600 text-xs mb-4">Upload your first document to start analyzing</p>
                    <Link href="/knowledge">
                      <Button size="sm" variant="gradient"><Upload className="w-4 h-4" /> Upload Documents</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                documents.slice(0, 5).map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="uppercase text-xs px-1.5 py-0">{doc.type}</Badge>
                              {doc.status === "ready" && <Badge variant="success" className="text-xs">Ready</Badge>}
                              {doc.status === "processing" && <Badge variant="warning" className="text-xs">Processing</Badge>}
                              {doc.wordCount > 0 && <span className="text-xs text-slate-500">{doc.wordCount.toLocaleString()} words</span>}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 shrink-0">{formatTimeAgo(new Date(doc.uploadedAt))}</span>
                        </div>
                        {doc.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 ml-11">
                            {doc.topics.slice(0, 3).map(t => (
                              <span key={t} className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick Upload */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Quick Upload</CardTitle></CardHeader>
                <CardContent>
                  <input ref={fileInputRef} type="file" multiple className="hidden"
                    accept=".pdf,.docx,.txt,.csv,.json,.md"
                    onChange={e => e.target.files && processFiles(e.target.files)} />
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                      dragging ? "border-violet-500 bg-violet-500/10" : "border-slate-700 hover:border-violet-500/50 hover:bg-slate-800/30"
                    )}
                  >
                    {uploading
                      ? <><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-xs text-violet-300">Processing...</p></>
                      : <><Upload className="w-7 h-7 text-slate-500 mx-auto mb-2" /><p className="text-xs text-slate-400">Drop files or click</p><p className="text-xs text-slate-600 mt-1">PDF, DOCX, TXT, CSV</p></>
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-300">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { href: "/chat", icon: Brain, label: "Ask AI a question", color: "text-violet-400 bg-violet-500/10" },
                    { href: "/evidence", icon: Shield, label: "Check evidence", color: "text-emerald-400 bg-emerald-500/10" },
                    { href: "/reports", icon: BarChart3, label: "Generate report", color: "text-amber-400 bg-amber-500/10" },
                    { href: "/settings", icon: Settings, label: "Configure API key", color: "text-cyan-400 bg-cyan-500/10" },
                  ].map(action => (
                    <Link key={action.href} href={action.href}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", action.color.split(" ")[1])}>
                          <action.icon className={cn("w-3.5 h-3.5", action.color.split(" ")[0])} />
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
