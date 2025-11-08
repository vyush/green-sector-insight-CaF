import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingDown,
  LineChart,
  Calculator,
  BarChart3,
  Atom,
  ShieldCheck,
  RefreshCcw,
  MessageSquare,
  Wand2,
} from "lucide-react";

export default function Methodology() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="default" className="text-xs">Investment-grade</Badge>
            <Badge variant="secondary" className="text-xs">Audit-ready</Badge>
            <Badge variant="outline" className="text-xs">Proprietary ML</Badge>
          </div>
          <h1 className="text-3xl font-bold">Methodology</h1>
          <p className="text-sm text-muted-foreground">
            Built for conviction. Our stack transforms raw operations into forward-looking, decision‑useful signals
            on emissions, targets, and carbon price exposure—delivered with clarity, discipline, and repeatability.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-primary">
          <Trophy className="h-8 w-8" />
        </div>
      </div>

      {/* 1. Data Foundation */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Atom className="h-5 w-5 text-primary" /> 1) Data Foundation
          </h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Comprehensive coverage across company and plant profiles, harmonized into an analysis‑ready layer.</li>
            <li>End‑to‑end standardization (kgCO₂/t, tonnes, tCO₂, ₹ Cr) for clean aggregation and peer comparison.</li>
            <li>Identity resolution on names/tickers; fidelity preserved for plant counts and production.</li>
            <li>Where available, aligned with BRSR and public disclosures for credibility and traceability.</li>
          </ul>
        </CardContent>
      </Card>

      {/* 2. Core Metrics */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> 2) Core Metrics
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">A. Emission Intensity</p>
              <p className="text-sm text-muted-foreground">
                We quantify production efficiency and blend plant‑level detail into company‑level truth using
                output‑aware aggregation. This surfaces the operational signal behind the noise.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Trend clarity across fiscal years—historical and forward‑looking.</li>
                <li>Peer‑ready and scale‑agnostic for clean comparability.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">B. Emissions</p>
              <p className="text-sm text-muted-foreground">
                We connect intensity and production to arrive at total emissions, then anchor projections to an FY25
                production baseline—cleanly isolating operational improvement from volume changes.
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Baseline integrity enables consistent FY26–FY27 comparatives.</li>
                <li>Outputs are portfolio‑friendly and decision‑useful.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. YoY + Projected Path */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" /> 3) Momentum‑Driven “Projected” Path
          </h2>
          <p className="text-sm text-muted-foreground">
            We distill recent momentum into a steady, portfolio‑grade “Projected” path—balanced enough to avoid
            over‑reacting to single‑year swings, consistent enough to compare across names, and visual‑first for clear narrative.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Momentum‑aware smoothing with robust guardrails.</li>
            <li>Comparable projection logic across the full coverage universe.</li>
            <li>Charts connect Actuals to Projected for intuitive interpretation.</li>
          </ul>
        </CardContent>
      </Card>

      {/* 4. Government Target Prediction (Proprietary ML) */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" /> 4) Government Target Prediction (Proprietary ML)
          </h2>
          <p className="text-sm text-muted-foreground">
            At the heart of our edge is a proprietary, constraint‑aware learning engine purpose‑built for policy signals.
            It fuses reduction momentum, renewable penetration, and enterprise scale into stable, sequential targets—
            calibrated to regulatory cadence and engineered for interpretability.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Constraint‑aware ensemble: emphasizes monotonicity, stability, and regulatory plausibility.</li>
            <li>Signal‑rich feature store: recent reduction pace, renewables share, and workforce scale.</li>
            <li>Sequential application: next‑year policy reductions roll forward cleanly into multi‑year targets.</li>
            <li>Audit‑ready outputs: directly tie into our charts and cost analytics for board‑grade storytelling.</li>
          </ul>
          <div className="text-xs text-muted-foreground">
            We deliberately abstract model internals; the focus is reliable, decision‑useful targets with transparent lineage.
          </div>
        </CardContent>
      </Card>

      {/* 5. Carbon Price Exposure */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> 5) Carbon Price Exposure and P&L Impact
          </h2>
          <p className="text-sm text-muted-foreground">
            We translate intensity gaps into excess‑emissions exposure under a configurable carbon price grounded on FY25
            production. Everything rolls up in tCO₂ and ₹ Cr—ready for investment committees and board packs.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Gap‑to‑target quantification across FY26–FY27.</li>
            <li>Scenario‑ready toggles for carbon price sensitivity.</li>
            <li>P&L‑aware outputs that tie climate to capital allocation.</li>
          </ul>
        </CardContent>
      </Card>

      {/* 6. Carbon AI Chat (Domain Copilot) */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> 6) Carbon AI Chat (Domain Copilot)
          </h2>
          <p className="text-sm text-muted-foreground">
            Meet your always‑on analyst. Our Carbon AI Chat is a domain‑tuned copilot built on a Gemini backbone with a
            proprietary orchestration layer. It consistently outperforms generic chatbots on carbon questions because it is
            grounded in our structured data, uses guardrailed prompts, and cites sources by design.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Structured‑data fusion: answers are aligned to in‑app metrics, not just the open web.</li>
            <li>Source‑grounded: links to reports (incl. BRSR) are surfaced where relevant.</li>
            <li>Deterministic configs: predictable outputs for the same inputs—ideal for workflows.</li>
            <li>Low‑latency, high‑signal: domain prompts, retrieval, and safety rails tuned for finance users.</li>
          </ul>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wand2 className="h-4 w-4" />
            The result: a carbon‑native assistant that’s sharper, more contextual, and more usable than generic chatbots for this problem set.
          </div>
        </CardContent>
      </Card>

      {/* 7. Quality, Sensitivity, Reproducibility */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> 7) Quality, Sensitivity, and Reproducibility
          </h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Deterministic by design: same inputs, same outputs—no black‑box surprises.</li>
            <li>Unit‑safe and label‑clean (FY23–FY25 actuals; FY26–FY27 projections).</li>
            <li>Portfolio‑ready metrics for apples‑to‑apples comparisons across names.</li>
            <li>Disclosure‑aligned where data is available; always traceable back to sources.</li>
          </ul>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCcw className="h-4 w-4" />
            Precision, transparency, and repeatability—so you can underwrite with confidence.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}