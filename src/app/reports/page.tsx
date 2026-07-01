"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, FileText, CheckCircle, Sparkles,
  Briefcase, TrendingUp, Megaphone, Users, Edit3, User,
  ChevronRight, X, Loader2, AlertCircle, Clock, Copy
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { generateReport } from "@/lib/ai-service";
import type { Report } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

// ─── static data ─────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: "executive", label: "Executive Summary",  icon: Briefcase },
  { id: "marketing", label: "Marketing Report",   icon: Megaphone },
  { id: "business",  label: "Business Report",    icon: BarChart3 },
  { id: "competitor",label: "Competitor Analysis",icon: TrendingUp },
  { id: "swot",      label: "SWOT Analysis",      icon: FileText },
  { id: "pestle",    label: "PESTLE Analysis",    icon: FileText },
  { id: "content",   label: "Content Brief",      icon: Edit3 },
  { id: "meeting",   label: "Meeting Summary",    icon: Users },
  { id: "research",  label: "Research Summary",   icon: FileText },
];

const PERSONAS = [
  { id: "ceo",       label: "CEO",            icon: Briefcase },
  { id: "marketing", label: "Marketing Mgr",  icon: Megaphone },
  { id: "sales",     label: "Sales Team",     icon: TrendingUp },
  { id: "investor",  label: "Investor",       icon: BarChart3 },
  { id: "product",   label: "Product Mgr",    icon: User },
  { id: "writer",    label: "Content Writer", icon: Edit3 },
];

const STATUS_CFG = {
  draft:    { label: "Draft",    variant: "secondary" as const },
  review:   { label: "Review",   variant: "warning"   as const },
  approved: { label: "Approved", variant: "success"   as const },
};

const WORKFLOW = ["AI Draft", "Review", "Approve", "Export"];

// ─── markdown renderer ────────────────────────────────────────────────────────

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-white mt-2 mb-4">{line.slice(2)}</h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg font-semibold text-slate-100 mt-7 mb-2 pb-1 border-b border-slate-800">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-slate-200 mt-5 mb-2">{line.slice(4)}</h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-violet-500 pl-3 my-2 text-xs text-slate-400 italic">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-slate-800 my-5" />);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-violet-400 mt-1.5 shrink-0">•</span>
          <span className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineMd(line.slice(2)) }} />
        </div>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1] || "1";
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-violet-400 text-xs font-bold mt-1 shrink-0 w-4">{num}.</span>
          <span className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineMd(line.replace(/^\d+\. /, "")) }} />
        </div>
      );
    } else if (line.startsWith("|")) {
      // Table — collect all table lines
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-: |]+\|$/));
      elements.push(
        <div key={`table-${i}`} className="my-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter(c => c.trim() !== "");
                return (
                  <tr key={ri} className={ri === 0 ? "border-b border-slate-700" : ""}>
                    {cells.map((cell, ci) => (
                      ri === 0
                        ? <th key={ci} className="text-left text-xs font-semibold text-slate-300 px-3 py-2 bg-slate-800/60">{cell.trim()}</th>
                        : <td key={ci} className="text-xs text-slate-400 px-3 py-2 border-b border-slate-800/40">{cell.trim()}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue; // i already advanced
    } else if (line === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />
      );
    }
    i++;
  }

  return <>{elements}</>;
}

/** Handle inline markdown: **bold**, *italic*, `code` */
function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-100 font-semibold'>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em class='text-slate-300'>$1</em>")
    .replace(/`(.*?)`/g, "<code class='text-violet-300 bg-violet-500/10 px-1 py-0.5 rounded text-xs'>$1</code>");
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { reports, addReport, updateReport, documents, openaiKey } = useAppStore();

  const [isDark,          setIsDark]          = useState(true);
  const [selectedType,    setSelectedType]    = useState("executive");
  const [selectedPersona, setSelectedPersona] = useState("ceo");
  const [generating,      setGenerating]      = useState(false);
  const [viewReportId,    setViewReportId]    = useState<string | null>(null);
  const [error,           setError]           = useState("");
  const [copied,          setCopied]          = useState(false);

  const readyDocs  = documents.filter(d => d.status === "ready");
  const viewReport = reports.find(r => r.id === viewReportId);
  const stepIndex  = !viewReport ? 0
    : viewReport.status === "draft"    ? 0
    : viewReport.status === "review"   ? 1
    : 2;

  // Generate a new report
  const handleGenerate = async () => {
    if (readyDocs.length === 0) {
      setError("Upload documents first before generating a report.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const content = await generateReport(readyDocs, selectedType, selectedPersona, openaiKey);
      const typeName    = REPORT_TYPES.find(t => t.id === selectedType)?.label    || selectedType;
      const personaName = PERSONAS.find(p => p.id === selectedPersona)?.label || selectedPersona;
      const newReport: Report = {
        id:          `rep-${Date.now()}`,
        title:       `${typeName} — ${personaName}`,
        type:        selectedType,
        persona:     selectedPersona,
        content,
        status:      "draft",
        createdAt:   new Date().toISOString(),
        workspaceId: "ws-default",
      };
      addReport(newReport);
      setViewReportId(newReport.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  // Copy report content
  const handleCopy = () => {
    if (!viewReport) return;
    navigator.clipboard.writeText(viewReport.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Reports"
          subtitle="Generate AI-powered business reports from your research"
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex min-w-0 overflow-hidden">

          {/* ── Left: config sidebar ── */}
          <div className="w-60 border-r border-slate-800 bg-slate-900/40 flex flex-col overflow-y-auto shrink-0">

            {/* Warnings */}
            {readyDocs.length === 0 && (
              <div className="m-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300">
                ⚠ <Link href="/knowledge" className="underline">Upload documents</Link> first
              </div>
            )}
            {!openaiKey && readyDocs.length > 0 && (
              <div className="m-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
                ℹ Demo mode. <Link href="/settings" className="underline">Add API key</Link> for full AI.
              </div>
            )}

            {/* Report type */}
            <div className="p-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Report Type
              </p>
              <div className="space-y-0.5">
                {REPORT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left",
                      selectedType === type.id
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <type.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona */}
            <div className="p-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                Persona
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all",
                      selectedPersona === p.id
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <p.icon className="w-3.5 h-3.5" />
                    <span className="text-center leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="p-3">
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleGenerate}
                loading={generating}
                disabled={readyDocs.length === 0}
              >
                <Sparkles className="w-4 h-4" />
                {generating ? "Generating…" : "Generate Report"}
              </Button>
            </div>
          </div>

          {/* ── Middle: reports list ── */}
          <div className="w-64 border-r border-slate-800 flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <p className="text-sm font-semibold text-white">Reports ({reports.length})</p>
            </div>

            {/* Error */}
            {error && (
              <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generating indicator */}
            {generating && (
              <div className="m-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                <span className="text-xs text-violet-300">Generating…</span>
              </div>
            )}

            {/* Empty state */}
            {reports.length === 0 && !generating && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <BarChart3 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No reports yet</p>
                  <p className="text-xs text-slate-600 mt-1">Select a type and click Generate</p>
                </div>
              </div>
            )}

            {/* Report list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {[...reports].reverse().map(report => {
                const cfg = STATUS_CFG[report.status] ?? STATUS_CFG.draft;
                return (
                  <motion.button
                    key={report.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setViewReportId(report.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all",
                      viewReportId === report.id
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-800 hover:border-slate-600 bg-slate-900/50"
                    )}
                  >
                    <p className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2">
                      {report.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDate(new Date(report.createdAt))}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Right: viewer ── */}
          {viewReport ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

              {/* Workflow bar */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 flex-wrap shrink-0">
                {WORKFLOW.map((step, idx) => (
                  <React.Fragment key={step}>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      idx === stepIndex   ? "bg-violet-600 text-white"
                      : idx < stepIndex   ? "bg-emerald-700 text-white"
                      : "bg-slate-800 text-slate-500"
                    )}>
                      {idx < stepIndex ? "✓ " : ""}{step}
                    </span>
                    {idx < WORKFLOW.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                    )}
                  </React.Fragment>
                ))}

                {/* Workflow actions */}
                <div className="ml-auto flex items-center gap-2">
                  {viewReport.status === "draft" && (
                    <Button size="sm" variant="secondary"
                      onClick={() => updateReport(viewReport.id, { status: "review" })}>
                      Submit for Review
                    </Button>
                  )}
                  {viewReport.status === "review" && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl h-8 px-3 text-xs"
                      onClick={() => updateReport(viewReport.id, { status: "approved" })}>
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                  )}
                  {viewReport.status === "approved" && (
                    <Button size="sm" variant="gradient" onClick={handleCopy}>
                      {copied
                        ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy Report</>
                      }
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setViewReportId(null)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>

              {/* Report content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                  <Markdown text={viewReport.content} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a report or generate a new one</p>
                <p className="text-slate-600 text-xs mt-1">Reports are saved automatically</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
