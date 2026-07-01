"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, BookOpen, MessageSquare,
  Network, Shield, BarChart3, Download, Settings,
  ChevronLeft, ChevronRight, Sparkles, FileText, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/workspace",  label: "Workspaces",    icon: FolderOpen },
  { href: "/knowledge",  label: "Documents",     icon: FileText },
  { href: "/chat",       label: "AI Chat",       icon: MessageSquare },
  { href: "/evidence",   label: "Evidence",      icon: Shield },
  { href: "/graph",      label: "Graph",         icon: Network },
  { href: "/reports",    label: "Reports",       icon: BarChart3 },
  { href: "/exports",    label: "Exports",       icon: Download },
  { href: "/settings",   label: "Settings",      icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { documents, openaiKey } = useAppStore();
  const readyDocs = documents.filter(d => d.status === "ready").length;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-slate-950 border-r border-slate-800 shrink-0 z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white text-sm leading-none">InsightFlow</p>
              <p className="text-xs text-slate-500 mt-0.5">AI Research</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const showBadge = item.href === "/knowledge" && readyDocs > 0;
          const showDot = item.href === "/settings" && !openaiKey;

          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group relative",
                isActive
                  ? "bg-violet-600/15 text-violet-300"
                  : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-200"
              )}>
                <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && showBadge && (
                  <span className="text-xs bg-violet-600 text-white rounded-full px-1.5 py-0.5 leading-none">{readyDocs}</span>
                )}
                {!collapsed && showDot && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full" title="API key not set" />
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-r-full" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status bar */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-2 mb-3 p-3 rounded-xl bg-slate-900 border border-slate-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-xs font-medium text-slate-400">Status</span>
              </div>
              <span className={cn("text-xs", openaiKey ? "text-emerald-400" : "text-amber-400")}>
                {openaiKey ? "AI Active" : "No API Key"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="w-3 h-3" />
              <span>{readyDocs} doc{readyDocs !== 1 ? "s" : ""} ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors z-30"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-slate-400" />
          : <ChevronLeft className="w-3 h-3 text-slate-400" />
        }
      </button>
    </motion.aside>
  );
}
