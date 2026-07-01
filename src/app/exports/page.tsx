"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FileText, FileCode, Copy, CheckCircle,
  Clock, BarChart3, AlertCircle, ExternalLink
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";

const exportFormats = [
  { id: "copy",     label: "Copy Text",     icon: Copy,     desc: "Copy to clipboard", color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "markdown", label: "Markdown",      icon: FileCode, desc: "Raw markdown",       color: "text-cyan-400",   bg: "bg-cyan-500/10" },
  { id: "txt",      label: "Plain Text",    icon: FileText, desc: "Clean text file",    color: "text-slate-400",  bg: "bg-slate-500/10" },
];

export default function ExportsPage() {
  const { reports, documents } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [format, setFormat] = useState("copy");
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const approvedReports = reports.filter(r => r.status === "approved");
  const allReports = [...reports].reverse();

  const handleExport = (report: typeof reports[0]) => {
    if (format === "copy" || format === "markdown") {
      navigator.clipboard.writeText(report.content).then(() => {
        setCopied(report.id);
        setMsg("Copied to clipboard!");
        setTimeout(() => { setCopied(null); setMsg(""); }, 2500);
      });
      return;
    }
    if (format === "txt") {
      // Strip markdown and download as .txt
      const clean = report.content.replace(/[#*>`_~]/g, "").replace(/\n{3,}/g, "\n\n");
      const blob = new Blob([clean], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Downloaded!");
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const handleExportAllDocs = () => {
    if (documents.length === 0) return;
    const content = documents
      .filter(d => d.status === "ready" && d.content)
      .map(d => `=== ${d.name} ===\n\n${d.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(content);
    setMsg("All document content copied!");
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Exports"
          subtitle="Download or copy your reports and documents"
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Success message */}
          <AnimatePresence>
            {msg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300"
              >
                <CheckCircle className="w-4 h-4" /> {msg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Format picker */}
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Export Format</h2>
            <div className="flex gap-3 flex-wrap">
              {exportFormats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all",
                    format === f.id ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", f.bg)}>
                    <f.icon className={cn("w-4 h-4", f.color)} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{f.label}</p>
                    <p className="text-xs text-slate-500">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reports to export */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300">Reports ({allReports.length})</h2>
              {reports.length === 0 && (
                <Link href="/reports">
                  <Button size="sm" variant="gradient" className="text-xs">Generate a Report</Button>
                </Link>
              )}
            </div>

            {reports.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-1">No reports yet</p>
                  <p className="text-slate-600 text-xs mb-4">Generate reports from the Reports page, then export them here</p>
                  <Link href="/reports">
                    <Button size="sm" variant="gradient">Go to Reports</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {allReports.map((report, i) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                            <BarChart3 className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{report.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge
                                variant={report.status === "approved" ? "success" : report.status === "review" ? "warning" : "secondary"}
                                className="text-xs capitalize"
                              >
                                {report.status}
                              </Badge>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{formatDate(new Date(report.createdAt))}
                              </span>
                              <span className="text-xs text-slate-600">{report.content.length} chars</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {report.status !== "approved" && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Not approved
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant={copied === report.id ? "secondary" : "gradient"}
                              onClick={() => handleExport(report)}
                              className="gap-1.5"
                            >
                              {copied === report.id
                                ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
                                : <><Download className="w-3.5 h-3.5" /> Export</>
                              }
                            </Button>
                            <Link href="/reports">
                              <Button size="sm" variant="ghost" className="gap-1 text-slate-400 hover:text-white">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Export all document content */}
          {documents.filter(d => d.status === "ready").length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Document Content</h2>
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">All Indexed Documents</p>
                      <p className="text-xs text-slate-500">
                        {documents.filter(d => d.status === "ready").length} documents ·{" "}
                        {documents.filter(d => d.status === "ready").reduce((a, d) => a + d.wordCount, 0).toLocaleString()} total words
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={handleExportAllDocs} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> Copy All Content
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
