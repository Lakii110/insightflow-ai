"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Key, Sliders, CreditCard, Eye, EyeOff,
  Check, AlertCircle, CheckCircle, ExternalLink
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "api",         label: "API Keys",     icon: Key },
  { id: "profile",     label: "Profile",      icon: User },
  { id: "preferences", label: "Preferences",  icon: Sliders },
  { id: "billing",     label: "Billing",      icon: CreditCard },
];

export default function SettingsPage() {
  const { openaiKey, setOpenaiKey } = useAppStore();

  const [isDark, setIsDark]     = useState(true);
  const [tab, setTab]           = useState("api");
  const [showKey, setShowKey]   = useState(false);
  const [keyInput, setKeyInput] = useState(openaiKey); // mirrors store
  const [saved, setSaved]       = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [confidence, setConfidence] = useState(75);
  const [notifs, setNotifs] = useState({ email: true, slack: false, weekly: true });

  // Save key to persistent store
  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setOpenaiKey(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Test key against OpenAI models endpoint
  const handleTestKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    setTestStatus("testing");
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      setTestStatus(res.ok ? "ok" : "fail");
    } catch {
      setTestStatus("fail");
    }
    // Reset status after 4 s
    setTimeout(() => setTestStatus("idle"), 4000);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title="Settings"
          subtitle="API keys, preferences and account"
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Tab bar */}
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    tab === t.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── API Keys tab ── */}
            {tab === "api" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Key className="w-4 h-4 text-violet-400" />
                      OpenAI API Key
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">

                    {/* Why needed */}
                    <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <p className="text-xs font-semibold text-violet-300 mb-1">Why is this needed?</p>
                      <p className="text-xs text-violet-300/70 leading-relaxed">
                        InsightFlow uses your OpenAI key to analyze documents, answer questions with
                        evidence, check claims and generate reports. The key is stored in your browser
                        only — never sent to our servers.
                      </p>
                    </div>

                    {/* Input + Test */}
                    <div>
                      <label className="text-sm text-slate-400 block mb-1.5">API Key</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showKey ? "text" : "password"}
                            value={keyInput}
                            onChange={e => setKeyInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                            placeholder="sk-proj-..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={handleTestKey}
                          disabled={!keyInput.trim() || testStatus === "testing"}
                          className="shrink-0"
                        >
                          {testStatus === "testing" ? "Testing…" : "Test Key"}
                        </Button>
                      </div>

                      {/* Feedback messages */}
                      {testStatus === "ok" && (
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Key is valid — ready to use!
                        </p>
                      )}
                      {testStatus === "fail" && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Invalid key or network error. Check and retry.
                        </p>
                      )}
                      {openaiKey && keyInput === openaiKey && testStatus === "idle" && (
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Key saved — AI features are active
                        </p>
                      )}
                      {!openaiKey && (
                        <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> No key saved — running in demo mode
                        </p>
                      )}
                    </div>

                    {/* How to get a key */}
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-400 mb-2">How to get an API key</p>
                      <p className="text-xs text-slate-500">1. Visit{" "}
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                          className="text-violet-400 hover:underline inline-flex items-center gap-0.5">
                          platform.openai.com/api-keys <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                      <p className="text-xs text-slate-500">2. Click <strong className="text-slate-400">Create new secret key</strong></p>
                      <p className="text-xs text-slate-500">3. Copy and paste it above, then click Save</p>
                      <p className="text-xs text-slate-500">4. Model used: <strong className="text-slate-400">gpt-4o-mini</strong> (fast & affordable)</p>
                    </div>

                    {/* Save button */}
                    <Button
                      variant="gradient"
                      className="w-full"
                      onClick={handleSaveKey}
                      disabled={!keyInput.trim()}
                    >
                      {saved
                        ? <><Check className="w-4 h-4" /> Saved!</>
                        : <><Save className="w-4 h-4" /> Save API Key</>
                      }
                    </Button>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Profile tab ── */}
            {tab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader><CardTitle className="text-white text-base">Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        U
                      </div>
                      <div>
                        <p className="font-medium text-white">User</p>
                        <Badge variant="purple">Pro Plan</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">First Name</label>
                        <Input defaultValue="Jordan" className="bg-slate-800 border-slate-700 text-slate-200" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                        <Input defaultValue="Davis" className="bg-slate-800 border-slate-700 text-slate-200" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Email</label>
                      <Input type="email" defaultValue="user@company.com" className="bg-slate-800 border-slate-700 text-slate-200" />
                    </div>
                    <Button variant="gradient" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                      {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Profile</>}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Preferences tab ── */}
            {tab === "preferences" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader><CardTitle className="text-white text-base">AI & Preferences</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">AI Confidence Threshold</p>
                          <p className="text-xs text-slate-500">Show warning when confidence drops below this</p>
                        </div>
                        <Badge variant={confidence >= 80 ? "success" : confidence >= 60 ? "warning" : "danger"}>
                          {confidence}%
                        </Badge>
                      </div>
                      <input
                        type="range" min={30} max={95} value={confidence}
                        onChange={e => setConfidence(+e.target.value)}
                        className="w-full accent-violet-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>30%</span><span>95%</span>
                      </div>
                    </div>

                    {[
                      { key: "email" as const,  label: "Email Notifications", desc: "Analysis completion emails" },
                      { key: "slack" as const,  label: "Slack Integration",   desc: "Post updates to Slack" },
                      { key: "weekly" as const, label: "Weekly Digest",       desc: "Summary of research activity" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors",
                            notifs[item.key] ? "bg-violet-600" : "bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform",
                            notifs[item.key] ? "translate-x-[22px]" : "translate-x-[3px]"
                          )} />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Billing tab ── */}
            {tab === "billing" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-violet-500/5 border-violet-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-white text-lg">Pro Plan</p>
                        <p className="text-sm text-slate-400">$79/month · Next renewal July 29, 2025</p>
                      </div>
                      <Badge variant="purple">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 mb-6">
                      {[
                        "Unlimited workspaces", "5,000 AI queries/mo",
                        "All report types",     "Evidence Checker",
                        "Research Graph",       "Priority support",
                      ].map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-slate-700 text-slate-300">Manage Billing</Button>
                      <Button variant="gradient">Upgrade to Enterprise</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// tiny helper so TS doesn't complain about the Save icon reference below
function Save(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
