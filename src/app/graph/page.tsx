"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ZoomIn, ZoomOut, RefreshCw, X, BookOpen, FileText, Tag } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

type NodeType = "topic" | "document" | "insight";
interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  docName?: string;
}
interface GraphEdge { from: string; to: string }

const nodeStyles: Record<NodeType, { border: string; bg: string; text: string; dot: string }> = {
  topic:    { border: "border-violet-500/70", bg: "bg-violet-500/15", text: "text-violet-200",  dot: "bg-violet-500" },
  document: { border: "border-blue-500/70",   bg: "bg-blue-500/15",   text: "text-blue-200",    dot: "bg-blue-500"   },
  insight:  { border: "border-emerald-500/70",bg: "bg-emerald-500/15",text: "text-emerald-200", dot: "bg-emerald-500"},
};

import type { UploadedDoc } from "@/lib/store";

function buildGraph(documents: UploadedDoc[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const topicMap = new Map<string, string>(); // topic label → node id

  const readyDocs = documents.filter(d => d.status === "ready");

  if (readyDocs.length === 0) return { nodes: [], edges: [] };

  // Place documents in a circle
  readyDocs.forEach((doc, i) => {
    const angle = (i / readyDocs.length) * 2 * Math.PI - Math.PI / 2;
    const r = 32;
    const cx = 50, cy = 50;
    const docNode: GraphNode = {
      id: `doc-${doc.id}`,
      label: doc.name.replace(/\.[^.]+$/, "").slice(0, 20),
      type: "document",
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      docName: doc.name,
    };
    nodes.push(docNode);

    // Topics for this doc
    doc.topics.forEach((topic, ti) => {
      const topicKey = topic.toLowerCase();
      if (!topicMap.has(topicKey)) {
        const tAngle = angle + (ti - doc.topics.length / 2) * 0.4;
        const tr = 16;
        const topicNode: GraphNode = {
          id: `topic-${topicKey}-${i}`,
          label: topic.slice(0, 18),
          type: "topic",
          x: docNode.x + tr * Math.cos(tAngle),
          y: docNode.y + tr * Math.sin(tAngle),
        };
        nodes.push(topicNode);
        topicMap.set(topicKey, topicNode.id);
        edges.push({ from: docNode.id, to: topicNode.id });
      } else {
        // Connect to existing topic node
        edges.push({ from: docNode.id, to: topicMap.get(topicKey)! });
      }
    });
  });

  // Clamp all node positions to viewport
  nodes.forEach(n => {
    n.x = Math.max(5, Math.min(95, n.x));
    n.y = Math.max(5, Math.min(95, n.y));
  });

  return { nodes, edges };
}

export default function GraphPage() {
  const { documents } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [filterType, setFilterType] = useState<NodeType | "all">("all");

  const { nodes, edges } = useMemo(() => buildGraph(documents), [documents]);
  const readyDocs = documents.filter(d => d.status === "ready");

  const visibleNodes = filterType === "all" ? nodes : nodes.filter(n => n.type === filterType);
  const visibleEdges = edges.filter(e =>
    visibleNodes.find(n => n.id === e.from) && visibleNodes.find(n => n.id === e.to)
  );

  const connectedNodes = selected
    ? edges.filter(e => e.from === selected.id || e.to === selected.id)
        .flatMap(e => [e.from, e.to])
        .filter(id => id !== selected.id)
    : [];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Research Graph"
          subtitle={nodes.length > 0 ? `${nodes.length} nodes · ${edges.length} connections` : "Upload documents to build graph"}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <div className="flex-1 flex min-w-0 overflow-hidden relative">
          {/* Graph canvas */}
          <div className="flex-1 relative overflow-hidden bg-slate-950">
            {/* Grid */}
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.06),transparent_65%)]" />

            {readyDocs.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Network className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium mb-2">No graph data yet</p>
                  <p className="text-slate-600 text-sm mb-6">Upload documents to build a visual knowledge map</p>
                  <Link href="/knowledge">
                    <Button variant="gradient">Upload Documents</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* SVG edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
                  {visibleEdges.map((edge, i) => {
                    const from = visibleNodes.find(n => n.id === edge.from);
                    const to = visibleNodes.find(n => n.id === edge.to);
                    if (!from || !to) return null;
                    const isHighlighted = selected && (edge.from === selected.id || edge.to === selected.id);
                    return (
                      <line key={i}
                        x1={`${from.x}%`} y1={`${from.y}%`}
                        x2={`${to.x}%`} y2={`${to.y}%`}
                        stroke={isHighlighted ? "rgba(124,58,237,0.8)" : "rgba(100,116,139,0.2)"}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={isHighlighted ? "0" : "4 4"}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {visibleNodes.map(node => {
                  const style = nodeStyles[node.type];
                  const isSelected = selected?.id === node.id;
                  const isConnected = connectedNodes.includes(node.id);
                  const isDimmed = selected && !isSelected && !isConnected;

                  return (
                    <motion.button
                      key={node.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: isDimmed ? 0.25 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22, delay: Math.random() * 0.2 }}
                      whileHover={{ scale: 1.12 }}
                      onClick={() => setSelected(isSelected ? null : node)}
                      style={{ position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%,-50%)" }}
                      className={cn(
                        "px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer whitespace-nowrap max-w-[140px] truncate",
                        style.bg, style.border, style.text,
                        isSelected && "ring-2 ring-white/40 shadow-xl scale-110",
                        "hover:brightness-125"
                      )}
                    >
                      {node.label}
                    </motion.button>
                  );
                })}

                {/* Zoom controls */}
                <div className="absolute bottom-5 left-5 flex flex-col gap-2">
                  {[
                    { icon: ZoomIn, action: () => setZoom(z => Math.min(z + 0.25, 2.5)) },
                    { icon: ZoomOut, action: () => setZoom(z => Math.max(z - 0.25, 0.3)) },
                    { icon: RefreshCw, action: () => setZoom(1) },
                  ].map(({ icon: Icon, action }, i) => (
                    <button key={i} onClick={action}
                      className="w-9 h-9 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors">
                      <Icon className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>

                {/* Legend + filter */}
                <div className="absolute bottom-5 right-5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                  {(["all", "document", "topic", "insight"] as const).map(type => {
                    const style = type !== "all" ? nodeStyles[type] : null;
                    return (
                      <button key={type} onClick={() => setFilterType(type)}
                        className={cn(
                          "flex items-center gap-2 text-xs capitalize transition-opacity px-2 py-1 rounded-lg",
                          filterType === type ? "bg-slate-800" : "opacity-60 hover:opacity-100"
                        )}>
                        {style
                          ? <span className={cn("w-2 h-2 rounded-full", style.dot)} />
                          : <span className="w-2 h-2 rounded-full bg-slate-500" />
                        }
                        <span className="text-slate-400">{type === "all" ? "All nodes" : type}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", nodeStyles[selected.type].dot)} />
                    <h3 className="font-semibold text-white text-sm truncate">{selected.label}</h3>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center shrink-0">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4 flex-1">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">{selected.type}</Badge>
                    {selected.docName && <Badge variant="secondary" className="text-xs truncate max-w-[150px]">{selected.docName.replace(/\.[^.]+$/, "")}</Badge>}
                  </div>

                  {/* Connected nodes */}
                  {connectedNodes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Connected ({connectedNodes.length})
                      </p>
                      <div className="space-y-1.5">
                        {connectedNodes.map(id => {
                          const conn = nodes.find(n => n.id === id);
                          if (!conn) return null;
                          return (
                            <button key={id} onClick={() => setSelected(conn)}
                              className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800 transition-colors text-left">
                              <span className={cn("w-2 h-2 rounded-full shrink-0", nodeStyles[conn.type].dot)} />
                              <span className="text-sm text-slate-300 truncate">{conn.label}</span>
                              <Badge variant="secondary" className="ml-auto text-xs capitalize shrink-0">{conn.type}</Badge>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Source document info */}
                  {selected.type === "document" && selected.docName && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Source</p>
                      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs text-blue-300 truncate">{selected.docName}</span>
                        </div>
                        {(() => {
                          const doc = documents.find(d => d.name === selected.docName);
                          return doc ? (
                            <>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-3">{doc.summary}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {doc.topics.slice(0, 3).map(t => (
                                  <span key={t} className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded-full">{t}</span>
                                ))}
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  )}

                  {selected.type === "topic" && (
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs text-slate-400">Topic Node</span>
                      </div>
                      <p className="text-xs text-slate-500">This topic was detected across {connectedNodes.length} document{connectedNodes.length !== 1 ? "s" : ""}.</p>
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
