"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, Paperclip, ChevronDown, ChevronUp, AlertTriangle,
  BookOpen, Lightbulb, Shield, Bot, User, Settings, Trash2,
  FileText, AlertCircle, X
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { sendChatMessage } from "@/lib/ai-service";
import type { ChatMessage } from "@/lib/store";
import { cn, getConfidenceColor, getConfidenceBg } from "@/lib/utils";
import Link from "next/link";

function EvidencePanel({ msg }: { msg: ChatMessage }) {
  const [openEvidence, setOpenEvidence] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      {/* Confidence */}
      {msg.confidence !== undefined && msg.confidence > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">AI Confidence</span>
              <span className={cn("text-sm font-bold", getConfidenceColor(msg.confidence))}>{msg.confidence}%</span>
            </div>
            <Progress value={msg.confidence} colorClass={getConfidenceBg(msg.confidence)} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Evidence Sources */}
      {msg.evidenceSources && msg.evidenceSources.length > 0 && (
        <div className="rounded-xl border border-slate-700/40 overflow-hidden">
          <button
            onClick={() => setOpenEvidence(!openEvidence)}
            className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              {msg.evidenceSources.length} Evidence Source{msg.evidenceSources.length > 1 ? "s" : ""}
            </span>
            {openEvidence ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <AnimatePresence>
            {openEvidence && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-3 space-y-2 bg-slate-900/60">
                  {msg.evidenceSources.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-cyan-400 truncate">{ev.docName}</span>
                        <Badge variant="success" className="text-xs px-1.5 py-0 shrink-0 ml-2">{ev.confidence}%</Badge>
                      </div>
                      <p className="text-xs text-slate-400 italic">&ldquo;{ev.excerpt}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Weaknesses */}
      {msg.weaknesses && msg.weaknesses.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Evidence Gaps
          </p>
          <ul className="space-y-0.5">
            {msg.weaknesses.map((w, i) => <li key={i} className="text-xs text-amber-300/80">• {w}</li>)}
          </ul>
        </div>
      )}

      {/* Contradictions */}
      {msg.contradictions && msg.contradictions.length > 0 && (
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Contradictions Found
          </p>
          <ul className="space-y-0.5">
            {msg.contradictions.map((c, i) => <li key={i} className="text-xs text-red-300/80">• {c}</li>)}
          </ul>
        </div>
      )}

      {/* Missing info */}
      {msg.missingInfo && msg.missingInfo.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <p className="text-xs font-medium text-slate-400 mb-1.5">Missing Information</p>
          <ul className="space-y-0.5">
            {msg.missingInfo.map((m, i) => <li key={i} className="text-xs text-slate-500">• {m}</li>)}
          </ul>
        </div>
      )}

      {/* Next Question */}
      {msg.nextQuestion && (
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <p className="text-xs font-medium text-violet-400 mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Suggested follow-up
          </p>
          <p className="text-xs text-violet-300/80">{msg.nextQuestion}</p>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { chatMessages, addChatMessage, clearChat, documents, openaiKey } = useAppStore();
  const [isDark, setIsDark] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setApiError("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setIsLoading(true);

    try {
      // Works with or without API key (ai-service handles demo mode)
      const response = await sendChatMessage(text, chatMessages, documents.filter(d => d.status === "ready"), openaiKey);
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: response.content || "No response generated.",
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        evidenceSources: response.evidenceSources,
        weaknesses: response.weaknesses,
        contradictions: response.contradictions,
        missingInfo: response.missingInfo,
        nextQuestion: response.nextQuestion,
      };
      addChatMessage(aiMsg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setApiError(msg);
      addChatMessage({
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: `Error: ${msg}`,
        timestamp: new Date().toISOString(),
        confidence: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the main findings in my documents?",
    "What risks should I be aware of?",
    "What opportunities have been identified?",
    "Summarize the key data points",
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="AI Chat"
          subtitle={documents.length > 0 ? `Analyzing ${documents.length} document${documents.length > 1 ? "s" : ""}` : "No documents loaded"}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          actions={
            chatMessages.length > 0 ? (
              <Button size="sm" variant="ghost" onClick={clearChat} className="text-slate-400 hover:text-white">
                <Trash2 className="w-4 h-4" /> Clear
              </Button>
            ) : undefined
          }
        />

        {/* No documents warning */}
        {documents.length === 0 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">No documents uploaded. <Link href="/knowledge" className="underline hover:text-amber-200">Upload documents first</Link> to get evidence-backed answers.</p>
          </div>
        )}

        {/* No API key warning */}
        {!openaiKey && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 flex items-center gap-3">
            <Settings className="w-4 h-4 text-violet-400 shrink-0" />
            <p className="text-sm text-violet-300">Add your OpenAI API key in <Link href="/settings" className="underline hover:text-violet-200">Settings</Link> for real AI analysis. Currently in demo mode.</p>
          </div>
        )}

        {/* API Error */}
        <AnimatePresence>
          {apiError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-6 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300 flex-1">{apiError}</p>
              <button onClick={() => setApiError("")}><X className="w-4 h-4 text-red-400" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">InsightFlow AI Chat</h3>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                Ask questions about your uploaded research. Every answer includes confidence scores, evidence sources, and data gaps.
              </p>
              {documents.length > 0 && (
                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {suggestedQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600 text-left text-sm text-slate-400 hover:text-slate-200 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                msg.role === "assistant" ? "bg-gradient-to-br from-violet-600 to-cyan-500" : "bg-slate-700"
              )}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-300" />}
              </div>
              <div className={cn("flex-1 min-w-0", msg.role === "user" ? "flex flex-col items-end" : "")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 max-w-2xl",
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-200"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === "assistant" && <EvidencePanel msg={msg} />}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                  />
                ))}
                <span className="text-xs text-slate-500 ml-2">Analyzing your research...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={documents.length > 0 ? "Ask about your research... (Enter to send)" : "Upload documents first, then ask questions..."}
                rows={1}
                className="w-full resize-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-h-[46px] max-h-36"
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              variant="gradient"
              size="icon"
              className="w-11 h-11 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">
            {openaiKey ? "Connected to OpenAI GPT-4o-mini" : "Demo mode — add API key in Settings for real AI"}
          </p>
        </div>
      </div>
    </div>
  );
}
