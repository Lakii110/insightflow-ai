"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Sun, Moon, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Topbar({ title, subtitle, actions, isDark, onToggleTheme }: TopbarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const { documents, reports, evidenceStatements } = useAppStore();

  // Build real notifications from app state
  const notifs = [
    documents.filter(d => d.status === "ready").length > 0 && {
      id: "docs",
      text: `${documents.filter(d => d.status === "ready").length} document${documents.filter(d => d.status === "ready").length !== 1 ? "s" : ""} ready for analysis`,
      unread: true,
      time: "Now",
    },
    evidenceStatements.length > 0 && {
      id: "evidence",
      text: `${evidenceStatements.length} evidence statements analyzed`,
      unread: evidenceStatements.some(s => s.status === "unsupported"),
      time: "Recent",
    },
    reports.length > 0 && {
      id: "reports",
      text: `${reports.length} report${reports.length !== 1 ? "s" : ""} generated`,
      unread: reports.some(r => r.status === "draft"),
      time: "Recent",
    },
  ].filter(Boolean) as { id: string; text: string; unread: boolean; time: string }[];

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <header className="h-14 flex items-center gap-3 px-5 bg-slate-950 border-b border-slate-800 shrink-0">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 leading-none mt-0.5">{subtitle}</p>}
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
          )}
        </button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Activity</span>
                <button onClick={() => setShowNotifs(false)}>
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              {notifs.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">No activity yet — upload documents to start</div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {notifs.map(n => (
                    <div key={n.id} className={`p-3 hover:bg-slate-800/50 transition-colors ${n.unread ? "bg-violet-500/5" : ""}`}>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-slate-600 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors"
      >
        {isDark
          ? <Sun className="w-4 h-4 text-amber-400" />
          : <Moon className="w-4 h-4 text-slate-400" />
        }
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-1.5 cursor-pointer group">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
          U
        </div>
        <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>
    </header>
  );
}
