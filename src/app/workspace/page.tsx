"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Plus, Search, FileText, Clock, X, Activity,
  ChevronRight, Trash2, Upload, Brain, BarChart3, Settings
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { cn, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

function healthColor(s: number) {
  if (s >= 80) return "text-emerald-400";
  if (s >= 50) return "text-amber-400";
  if (s > 0) return "text-red-400";
  return "text-slate-500";
}
function healthBg(s: number) {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 50) return "bg-amber-500";
  if (s > 0) return "bg-red-500";
  return "bg-slate-700";
}

export default function WorkspacePage() {
  const { workspaces, documents, reports, addWorkspace, openaiKey } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const readyDocs = documents.filter(d => d.status === "ready");

  // Build workspace stats from real data
  const enrichedWorkspaces = workspaces.map(ws => {
    const wsDocs = ws.id === "ws-default" ? readyDocs : readyDocs.filter(d => ws.documentIds.includes(d.id));
    const wsReports = reports.filter(r => r.workspaceId === ws.id);
    const score = Math.min(100, wsDocs.length * 15 + wsReports.length * 10 + (openaiKey ? 20 : 0));
    return { ...ws, docCount: wsDocs.length, reportCount: wsReports.length, healthScore: score };
  });

  const filtered = enrichedWorkspaces.filter(ws =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    addWorkspace({
      id: `ws-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "New research workspace",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentIds: [],
      tags: [],
      healthScore: 0,
    });
    setNewName("");
    setNewDesc("");
    setShowNew(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Workspaces"
          subtitle={`${workspaces.length} workspace${workspaces.length !== 1 ? "s" : ""}`}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          actions={
            <Button size="sm" variant="gradient" onClick={() => setShowNew(true)}>
              <Plus className="w-4 h-4" /> New Workspace
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview banner */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Documents Ready", value: readyDocs.length, icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
              { label: "Reports Generated", value: reports.length, icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "AI Status", value: openaiKey ? "Active" : "Demo Mode", icon: Brain, color: openaiKey ? "text-cyan-400" : "text-amber-400", bg: openaiKey ? "bg-cyan-500/10" : "bg-amber-500/10" },
            ].map(item => (
              <Card key={item.label} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", item.bg)}>
                    <item.icon className={cn("w-4.5 h-4.5", item.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="mb-5">
            <Input
              placeholder="Search workspaces..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* New workspace card */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowNew(true)}
              className="border-2 border-dashed border-slate-700 hover:border-violet-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[180px] hover:bg-violet-500/5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-violet-400" />
              </div>
              <p className="font-medium text-slate-300">New Workspace</p>
              <p className="text-xs text-slate-500">Organize your research projects</p>
            </motion.button>

            {filtered.map((ws, i) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="bg-slate-900 border-slate-800 overflow-hidden card-hover">
                  {/* Health bar */}
                  <div className="h-1 w-full bg-slate-800">
                    <div className={cn("h-full transition-all", healthBg(ws.healthScore))} style={{ width: `${ws.healthScore}%` }} />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className={cn("text-sm font-bold", healthColor(ws.healthScore))}>
                        {ws.healthScore > 0 ? `${ws.healthScore}%` : "—"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1 truncate">{ws.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ws.description}</p>

                    <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />{ws.docCount} doc{ws.docCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />{ws.reportCount} report{ws.reportCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />{formatTimeAgo(new Date(ws.updatedAt))}
                      </span>
                    </div>

                    {ws.docCount === 0 ? (
                      <Link href="/knowledge">
                        <Button size="sm" variant="secondary" className="w-full text-xs gap-1.5">
                          <Upload className="w-3 h-3" /> Upload Documents
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link href="/chat" className="flex-1">
                          <Button size="sm" variant="gradient" className="w-full text-xs gap-1">
                            <Brain className="w-3 h-3" /> Ask AI
                          </Button>
                        </Link>
                        <Link href="/reports" className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full text-xs gap-1">
                            <BarChart3 className="w-3 h-3" /> Report
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick start guide if empty */}
          {readyDocs.length === 0 && (
            <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h3 className="font-semibold text-white mb-4">Quick Start</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Upload Documents", desc: "Add PDFs, DOCX, TXT, CSV files", href: "/knowledge", color: "text-violet-400 bg-violet-500/10" },
                  { step: "2", title: "Add API Key", desc: "Enable AI analysis in Settings", href: "/settings", color: "text-cyan-400 bg-cyan-500/10" },
                  { step: "3", title: "Generate Insights", desc: "Chat, evidence check, reports", href: "/chat", color: "text-emerald-400 bg-emerald-500/10" },
                ].map(item => (
                  <Link key={item.step} href={item.href}>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0", item.color.split(" ")[1], item.color.split(" ")[0])}>
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 ml-auto mt-0.5 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Workspace Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white">Create New Workspace</h2>
                <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">Workspace Name *</label>
                  <Input
                    placeholder="e.g. Q4 Competitor Research"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">Description</label>
                  <Input
                    placeholder="What is this workspace for?"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1 border-slate-700 text-slate-300" onClick={() => setShowNew(false)}>Cancel</Button>
                  <Button variant="gradient" className="flex-1" onClick={handleCreate} disabled={!newName.trim()}>Create Workspace</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
