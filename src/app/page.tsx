"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Play, Upload, Network, Shield, MessageSquare,
  BarChart3, Lightbulb, FileText, Check, Star, Zap, TrendingUp, Users,
  ChevronRight, Brain, Globe, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ease = [0.22, 1, 0.36, 1] as const;

const workflowSteps = [
  { icon: Upload, label: "Upload", desc: "Drop any file type", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Sparkles, label: "Analyze", desc: "AI extracts insights", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Shield, label: "Verify", desc: "Evidence checked", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: FileText, label: "Generate", desc: "Reports created", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: MessageSquare, label: "Review", desc: "Human approval", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: BarChart3, label: "Export", desc: "Share anywhere", color: "text-blue-400", bg: "bg-blue-500/10" },
];

const features = [
  { icon: Network, title: "Research Graph", desc: "Visualize how your research connects. Discover hidden relationships between topics, documents and insights.", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Shield, title: "Evidence Checker", desc: "Every AI statement is backed by source evidence. Green, amber, or red — know exactly what's proven.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: MessageSquare, title: "AI Chat", desc: "Ask anything about your research. Get answers with confidence scores, sources, and missing info flags.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: BarChart3, title: "Business Reports", desc: "Generate executive summaries, SWOT analyses, competitor reports, and more — tailored per persona.", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Lightbulb, title: "Smart Insights", desc: "Automatically surface trends, risks, opportunities, and contradictions from across all your documents.", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Brain, title: "Decision Assistant", desc: "Get decision confidence scores, risk levels, and recommended next actions based on your research.", color: "text-blue-400", bg: "bg-blue-500/10" },
];

const pricing = [
  {
    name: "Starter", price: "$29", period: "/mo", desc: "For individuals and small teams",
    features: ["10 workspaces", "50 documents", "500 AI queries/mo", "PDF & DOCX support", "Basic reports"],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Pro", price: "$79", period: "/mo", desc: "For growing teams",
    features: ["Unlimited workspaces", "500 documents", "5,000 AI queries/mo", "All file types", "All report types", "Research Graph", "Evidence Checker", "Persona reports"],
    cta: "Start Free Trial", highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", desc: "For large organizations",
    features: ["Unlimited everything", "Custom AI models", "SSO & SAML", "Dedicated support", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales", highlight: false,
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "Head of Marketing", company: "Techflow Inc", avatar: "SC", quote: "InsightFlow cut our research-to-decision time from 2 weeks to 2 hours. The evidence checker alone is worth the price.", rating: 5 },
  { name: "Marcus Williams", role: "Strategy Consultant", company: "BCG", avatar: "MW", quote: "We use it for every competitive analysis. The research graph visualizes connections we'd never see manually.", rating: 5 },
  { name: "Priya Sharma", role: "Product Manager", company: "Notion", avatar: "PS", quote: "The persona-based reports are a game changer. I send the CEO version to execs and the detailed version to my team.", rating: 5 },
];

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">InsightFlow AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "About"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="gradient" size="sm">Get Started <ArrowRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-6 bg-violet-500/10 text-violet-300 border border-violet-500/20 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1.5" /> Powered by GPT-4 + RAG
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold leading-[1.05] mb-6"
          >
            <span className="text-white">Stop Reading.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Start Understanding.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            Transform messy research into trustworthy business decisions in minutes. Evidence-based AI with full transparency.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <Button variant="gradient" size="lg" className="px-8 text-base">
                <Upload className="w-4 h-4" /> Upload Research
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 text-base border-slate-700 text-slate-300 hover:bg-slate-800">
              <Play className="w-4 h-4" /> Watch Demo
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500"
          >
            {["No credit card required", "14-day free trial", "SOC 2 certified"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl font-bold text-white">Six steps to clarity</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center relative`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                  {i < workflowSteps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything your team needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Not just a summarizer — a full research workspace with evidence-grade AI and business-ready outputs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                onHoverStart={() => setHoveredFeature(i)} onHoverEnd={() => setHoveredFeature(null)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-default ${hoveredFeature === i ? "border-violet-500/40 bg-violet-500/5" : "border-slate-800 bg-slate-900/60"}`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["10,000+", "Teams using InsightFlow"], ["98%", "Evidence accuracy rate"], ["15x", "Faster than manual research"], ["SOC 2", "Security certified"]].map(([val, lbl]) => (
            <motion.div key={lbl} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{val}</div>
              <div className="text-sm text-slate-400 mt-1">{lbl}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sample Cases */}
      <section className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">Real Examples</p>
            <h2 className="text-4xl font-bold text-white mb-4">See it in action</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Three real use cases showing exactly what InsightFlow produces — with evidence scores, weak claim flags, and human review.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                case: "Case 1",
                label: "Marketing Research",
                input: "5 marketing articles + competitor PDFs",
                output: "Marketing Report",
                confidence: 87,
                flags: ["2 unsupported claims detected", "Missing competitor pricing data"],
                status: "approved",
                color: "violet",
              },
              {
                case: "Case 2",
                label: "Meeting Notes",
                input: "Meeting notes TXT file (3,200 words)",
                output: "Executive Summary for CEO",
                confidence: 94,
                flags: ["Missing budget data", "3 action items need human sign-off"],
                status: "review",
                color: "cyan",
              },
              {
                case: "Case 3",
                label: "Industry Research",
                input: "Gartner research PDF (18,900 words)",
                output: "SWOT Analysis",
                confidence: 71,
                flags: ["⚠ Low confidence on market size claim", "Human approval required"],
                status: "draft",
                color: "amber",
              },
            ].map((c, i) => (
              <motion.div
                key={c.case}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.case}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    c.status === "review"   ? "bg-amber-500/10 text-amber-400" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {c.status === "approved" ? "✓ Approved" : c.status === "review" ? "⏳ In Review" : "◐ Draft"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{c.label}</h3>
                  <p className="text-xs text-slate-500">Input: {c.input}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <p className="text-xs text-slate-400 mb-1">Output</p>
                  <p className="text-sm font-medium text-white">{c.output}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.confidence >= 80 ? "bg-emerald-500" : c.confidence >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${c.confidence}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${c.confidence >= 80 ? "text-emerald-400" : c.confidence >= 60 ? "text-amber-400" : "text-red-400"}`}>
                      {c.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Confidence Score</p>
                </div>
                <div className="space-y-1.5">
                  {c.flags.map((flag, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <span className="text-amber-400 text-xs mt-0.5 shrink-0">⚠</span>
                      <span className="text-xs text-slate-400">{flag}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Human Review Workflow */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">Responsible AI</p>
            <h2 className="text-4xl font-bold text-white mb-4">Human review before every export</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Nothing leaves InsightFlow without a human approving it first. AI drafts, humans decide.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start gap-4">
            {[
              { step: "1", title: "AI Draft", desc: "AI generates report with confidence scores and evidence citations", icon: "🤖", color: "bg-violet-500/10 border-violet-500/30" },
              { step: "2", title: "Evidence Check", desc: "Every claim is verified — Supported, Partial, or Unsupported", icon: "🛡", color: "bg-cyan-500/10 border-cyan-500/30" },
              { step: "3", title: "Human Review", desc: "Reviewer reads the draft, checks flags, and can edit before approving", icon: "👤", color: "bg-amber-500/10 border-amber-500/30" },
              { step: "4", title: "Approve", desc: "Reviewer clicks Approve — only then is the report exportable", icon: "✅", color: "bg-emerald-500/10 border-emerald-500/30" },
              { step: "5", title: "Export", desc: "Copy to clipboard or download — clean, professional output", icon: "📤", color: "bg-slate-700/50 border-slate-600/30" },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex-1 p-5 rounded-2xl border ${s.color}`}
                >
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <p className="text-xs text-slate-500 mb-1">Step {s.step}</p>
                  <p className="font-semibold text-white mb-2">{s.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </motion.div>
                {i < 4 && (
                  <div className="hidden md:flex items-center self-center shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl border ${plan.highlight ? "border-violet-500 bg-violet-600/10" : "border-slate-800 bg-slate-900/60"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="purple" className="px-4">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm text-slate-400 mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-400 mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button variant={plan.highlight ? "gradient" : "outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold text-white">Loved by teams worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to make smarter decisions?</h2>
            <p className="text-slate-400 mb-8">Join 10,000+ teams who trust InsightFlow to turn research into results.</p>
            <Link href="/dashboard">
              <Button variant="gradient" size="lg" className="px-10 text-base">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">InsightFlow AI</span>
            <span className="text-slate-500 text-xs ml-2">Research → Evidence → Decisions</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            {["Privacy", "Terms", "Security", "Docs"].map(l => (
              <a key={l} href="#" className="hover:text-slate-300 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-slate-600">© 2024 InsightFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
