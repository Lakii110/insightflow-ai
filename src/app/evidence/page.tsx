"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, BookOpen, Brain,
  Loader2, AlertCircle, RefreshCw, Settings
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { generateEvidenceCheck } from "@/lib/ai-service";
import type { EvidenceStatement } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── status config ────────────────────────────────────────────────────────────

const STATUS = {
  supported: {
    label: "Supported",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    badge: "success" as const,
    bar: "bg-emerald-500",
  },
  partial: {
    label: "Partially Supported",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    badge: "warning" as const,
    bar: "bg-amber-500",
  },
  unsupported: {
    label: "Unsupported",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/5 border-red-500/20",
    badge: "danger" as const,
    bar: "bg-red-500",
  },
} as const;

// ─── single statement card ────────────────────────────────────────────────────

function StatementCard({ stmt }: { stmt: EvidenceStatement }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS[stmt.status];

  return (
    <Card className={cn("border overflow-hidden transition-all", cfg.bg)}>
      {/* Header row — always visible */}
      <button
        className="w-full p-4 text-left hover:brightness-105 transition-all"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-start gap-3">
          <cfg.icon className={cn("w-5 h-5 mt-0.5 shrink-0", cfg.color)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 leading-relaxed mb-2">{stmt.text}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={cfg.badge}>{cfg.label}</Badge>
              <span className={cn("text-xs font-semibold", cfg.color)}>
                {stmt.confidence}% confidence
              </span>
              {stmt.sourceDoc && (
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {stmt.sourceDoc}
                </span>
              )}
            </div>
          </div>
          {open
            ? <ChevronUp  className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
            : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
          }
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-slate-700/20"
          >
            <div className="p-4 space-y-3 bg-slate-900/50">

              {/* Source excerpt */}
              {stmt.excerpt && (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-400">Source Excerpt</span>
                  </div>
                  <p className="text-xs text-slate-300 italic bg-slate-800/60 rounded-lg p-3 border border-slate-700/40 leading-relaxed">
                    &ldquo;{stmt.excerpt}&rdquo;
                  </p>
                </div>
              )}

              {/* AI reasoning */}
              {stmt.reasoning && (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-medium text-slate-400">Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{stmt.reasoning}</p>
                </div>
              )}

              {/* Confidence bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Confidence</span>
                  <span className={cn("text-xs font-bold", cfg.color)}>{stmt.confidence}%</span>
                </div>
                <Progress value={stmt.confidence} colorClass={cfg.bar} className="h-1.5" />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

type Filter = "all" | "supported" | "partial" | "unsupported";

export default function EvidencePage() {
  const {
    evidenceStatements, setEvidenceStatements,
    documents, openaiKey,
  } = useAppStore();

  const [isDark,  setIsDark]  = useState(true);
  const [filter,  setFilter]  = useState<Filter>("all");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const readyDocs = documents.filter(d => d.status === "ready");

  const counts = {
    supported:   evidenceStatements.filter(s => s.status === "supported").length,
    partial:     evidenceStatements.filter(s => s.status === "partial").length,
    unsupported: evidenceStatements.filter(s => s.status === "unsupported").length,
  };

  const filtered =
    filter === "all"
      ? evidenceStatements
      : evidenceStatements.filter(s => s.status === filter);

  // Run analysis (works in demo mode too)
  const runAnalysis = useCallback(async () => {
    if (readyDocs.length === 0) {
      setError("Upload documents first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const stmts = await generateEvidenceCheck(readyDocs, openaiKey);
      setEvidenceStatements(stmts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed — check your API key.");
    } finally {
      setLoading(false);
    }
  }, [readyDocs, openaiKey, setEvidenceStatements]);

  // Auto-run once if docs are ready but no statements yet
  useEffect(() => {
    if (readyDocs.length > 0 && evidenceStatements.length === 0) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Evidence Checker"
          subtitle="Every AI claim verified against your source documents"
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          actions={
            <Button
              size="sm"
              variant="gradient"
              onClick={runAnalysis}
              loading={loading}
              disabled={readyDocs.length === 0}
            >
              {loading
                ? "Analyzing…"
                : <><RefreshCw className="w-4 h-4" /> {evidenceStatements.length > 0 ? "Re-analyze" : "Run Analysis"}</>
              }
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* No docs warning */}
          {readyDocs.length === 0 && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-sm text-amber-300">
                No documents uploaded.{" "}
                <Link href="/knowledge" className="underline hover:text-amber-200">
                  Upload documents
                </Link>{" "}
                to run an evidence check.
              </p>
            </div>
          )}

          {/* Demo mode notice */}
          {!openaiKey && readyDocs.length > 0 && (
            <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 flex items-center gap-3">
              <Settings className="w-4 h-4 text-violet-400 shrink-0" />
              <p className="text-sm text-violet-300">
                Demo mode — results use local analysis.{" "}
                <Link href="/settings" className="underline hover:text-violet-200">
                  Add API key
                </Link>{" "}
                for full AI evidence checking.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-300 font-medium">Analyzing evidence…</p>
                <p className="text-slate-500 text-sm mt-1">Reading documents and checking every claim</p>
              </div>
            </div>
          )}

          {/* Summary stat cards */}
          {!loading && evidenceStatements.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {(["supported", "partial", "unsupported"] as const).map(s => {
                const cfg = STATUS[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(filter === s ? "all" : s)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      filter === s ? cfg.bg : "bg-slate-900 border-slate-800 hover:border-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                      <span className={cn("text-2xl font-bold", cfg.color)}>{counts[s]}</span>
                    </div>
                    <p className="text-xs text-slate-400 capitalize">{s}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && evidenceStatements.length === 0 && readyDocs.length > 0 && (
            <div className="text-center py-16">
              <Shield className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-2">No analysis yet</p>
              <p className="text-slate-600 text-sm mb-6">Click Run Analysis to check evidence in your documents</p>
              <Button variant="gradient" onClick={runAnalysis}>
                <RefreshCw className="w-4 h-4" /> Run Analysis
              </Button>
            </div>
          )}

          {/* Filter chips */}
          {!loading && evidenceStatements.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "supported", "partial", "unsupported"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors",
                    filter === f
                      ? "bg-violet-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  {f === "all"
                    ? `All (${evidenceStatements.length})`
                    : `${f} (${counts[f]})`
                  }
                </button>
              ))}
            </div>
          )}

          {/* Statement cards */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map(stmt => (
                <StatementCard key={stmt.id} stmt={stmt} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
