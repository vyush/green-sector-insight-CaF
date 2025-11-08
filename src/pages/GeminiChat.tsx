import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Sparkles, AlertCircle, Globe, Loader2, Link as LinkIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cementCompanies as defaultCompanies } from "@/data/companies";

// Client-visible config (use a proxy for production)
const API_KEY = "AIzaSyByTjVaz1yjWY3oY6OQaW_gwZATYutfmY4";
// Default to a broadly-available model; function below will try others if needed
const MODEL_DEFAULT = "gemini-1.5-flash-latest";

// ------------- Types -------------
type Msg = { role: "user" | "model"; text: string };
type CompanyLite = { id?: string; name?: string; ticker?: string; plants?: any[] };
type SourceLink = { title: string; url: string };

// --- Grounding helpers ---
const MAX_DATA_CHARS = 40000;
const MAX_PLANTS_PER_COMPANY = 12;

// text utils for fuzzy matching
function normalizeText(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\.\,\'\"\(\)\&]/g, "")
    .replace(/\blimited\b|\bltd\b|\bcement(s)?\b|\bco\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// Add these helpers
function normalizeCompany(c: any) {
  const plants: any[] = Array.isArray(c?.plants) ? c.plants.slice(0, MAX_PLANTS_PER_COMPANY) : [];
  return {
    id: c?.id ?? undefined,
    name: c?.name ?? c?.company ?? c?.Company ?? undefined,
    ticker: c?.ticker ?? c?.symbol ?? undefined,
    plants_count: Array.isArray(c?.plants) ? c.plants.length : undefined,
    plants: plants.map((p) => ({
      name: p?.name ?? p?.plantName ?? p?.location ?? p?.site ?? undefined,
      capacity_mtpa: p?.capacityMtpa ?? p?.capacity ?? p?.mtpa ?? undefined,
      output_t: p?.output ?? p?.production ?? p?.throughput_t ?? p?.volume_t ?? undefined,
      intensity_kgco2_per_t:
        p?.intensity ?? p?.emissionIntensity ?? p?.kgCO2PerTonne ?? p?.kgco2_t ?? undefined,
      targetIntensity_kgco2_per_t:
        p?.targetIntensity ?? p?.govTarget ?? p?.govTargetIntensity ?? undefined,
      region: p?.state ?? p?.region ?? undefined,
    })),
  };
}

function selectRelevantCompanies(query: string, companies: CompanyLite[]) {
  const qRaw = query || "";
  const q = normalizeText(qRaw);
  if (!q) return companies;
  const qTokens = q.split(/\s+/).filter(Boolean);

  const scored = companies.map((c) => {
    const name = normalizeText((c?.name as string) || "");
    const ticker = normalizeText((c?.ticker as string) || "");
    const aliases = new Set<string>(
      [name, ticker, name.split(" ")[0] || "", name.split(" ")[1] || ""].filter(Boolean)
    );

    // direct contains boosts
    let best = 0;
    for (const tok of qTokens) {
      for (const alias of aliases) {
        const sim = Math.max(similarity(tok, alias), alias.includes(tok) ? 0.88 : 0, tok.includes(alias) ? 0.88 : 0);
        if (sim > best) best = sim;
      }
    }
    return { c, score: best };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.filter((s) => s.score >= 0.55).map((s) => s.c);
  return selected.length ? selected : companies;
}

function buildDataAppendix(companies: CompanyLite[]) {
  const simplified = companies.map(normalizeCompany);
  let json = JSON.stringify({ companies: simplified }, null, 2);
  if (json.length > MAX_DATA_CHARS) json = json.slice(0, MAX_DATA_CHARS) + "\n...truncated...";
  return json;
}

// NEW: send the exact dashboard data (preferred)
function buildRawAppendix(allCompanies: any[]) {
  let json = JSON.stringify({ companies_raw: allCompanies }, null, 2);
  if (json.length > MAX_DATA_CHARS) json = json.slice(0, MAX_DATA_CHARS) + "\n...truncated...";
  return json;
}

// --- Prompt ---
function buildSystemInstruction({
  carbonPrice,
  companies,
  appendixJson,
}: {
  carbonPrice: number;
  companies: CompanyLite[];
  appendixJson: string;
}) {
  const list = companies
    .map((c) => {
      const plants = Array.isArray(c?.plants) ? c.plants.length : undefined;
      return `- ${c?.name ?? "Company"}${c?.ticker ? ` (${c.ticker})` : ""}${plants ? ` — ${plants} plants` : ""}`;
    })
    .join("\n");

  return `
You are an AI assistant that provides data and analysis on cement companies’ emissions and environmental targets. Do not provide or imply investment advice, and do not add disclaimers about authorization. Keep responses concise and focused on emissions, targets, and carbon-price exposure.

House style:
- Clear Markdown with headings and bullet points.
- Always use units (kgCO2/t, tCO2, USD). Show short formulas for calculations.

Context:
- Current carbon price: ${carbonPrice} USD/tCO2e.
- Scope: plant/company emission intensity, government target alignment, excess emissions cost.
- Companies in scope:
${list || "- (none listed)"}

Methodology:
- Intensity = (Scope 1 + Scope 2) / output (t).
- Company intensity = weighted average of plants.
- Government target = plant-level % reduction (Gazette).
- Projected intensity = trend (last 3y) adjusted for targets.
- Excess emissions cost = max(0, projected − target) × Output × Carbon price.

Dashboard data (use primary fields from companies_raw; normalized view is backup):
${appendixJson}

When web is enabled, you may use web results for fresh context and cite sources, but prefer dashboard numbers for metrics.
`;
}

// --- API call (Gemini with Google Search tool) ---
async function callGeminiREST({
  history,
  userText,
  systemInstruction,
  enableWeb,
}: {
  history: Msg[];
  userText: string;
  systemInstruction: string;
  enableWeb: boolean;
}): Promise<{ text: string; sources: SourceLink[]; modelUsed: string }> {
  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userText }] },
  ];

  // Try v1 first (most keys), then v1beta as fallback. Use -latest first.
  // const versions = ["v1", "v1beta"];
  // const candidates = [
  //   "gemini-1.5-flash-latest",
  //   "gemini-1.5-pro-latest",
  //   "gemini-1.5-flash-8b-latest",
  //   "gemini-1.5-pro",
  //   "gemini-2.5-flash",
  // ];
  const versions = ["v1beta"];
  const candidates = [
    "gemini-2.5-flash",
  ];

  let lastError: any = null;
  for (const version of versions) {
    for (const model of candidates) {
      const baseUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(
        API_KEY
      )}`;

      // First try with web tool if enabled
      for (const tryWeb of [enableWeb, false]) {
        try {
          const res = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 3584 },
              ...(tryWeb ? { tools: [{ google_search: {} }] } : {}),
            }),
          });

          if (!res.ok) {
            const j = await res.json().catch(async () => await res.text());
            const msg = typeof j === "string" ? j : j?.error?.message || JSON.stringify(j);
            // If tool unsupported, fall back to same model without tools (handled by loop)
            lastError = new Error(msg);
            continue;
          }

          const data = await res.json();
          const cand = data?.candidates?.[0];
          const text = cand?.content?.parts?.map((p: any) => p.text).join("") ?? "No response.";
          const sources: SourceLink[] = [];
          const gm = cand?.groundingMetadata?.searchSources;
          if (Array.isArray(gm)) {
            for (const s of gm) {
              if (s?.uri) sources.push({ title: s?.title || s.uri, url: s?.uri });
            }
          }
          const cm = cand?.citationMetadata?.citationSources;
          if (Array.isArray(cm)) {
            for (const s of cm) {
              if (s?.uri) sources.push({ title: s?.title || s.uri, url: s?.uri });
            }
          }
          return { text, sources, modelUsed: `${version}/${model}` };
        } catch (e) {
          lastError = e;
          continue;
        }
      }
    }
  }
  throw lastError || new Error("All model attempts failed");
}

// --- Component ---
type GeminiChatProps = { carbonPrice: number; companies?: CompanyLite[] };

export default function GeminiChat({ carbonPrice, companies = [] }: GeminiChatProps) {
  const mergedCompanies: CompanyLite[] =
    (companies && companies.length ? companies : (defaultCompanies as any)) ?? [];

  const [messages, setMessages] = useState<Msg[]>([
    { role: "model", text: "Hi! Ask about emissions, targets, carbon-price impact, or any company in this dashboard." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useWeb, setUseWeb] = useState<boolean>(true); // default ON
  const [webBusy, setWebBusy] = useState<boolean>(false);
  const [lastSources, setLastSources] = useState<SourceLink[] | null>(null);
  const [lastModel, setLastModel] = useState<string>(MODEL_DEFAULT);

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(() => !!input.trim() && !loading && !webBusy, [input, loading, webBusy]);

  async function send() {
    if (!canSend) return;
    setErrorMsg(null);
    const userText = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setLoading(true);

    try {
      // Prefer sending all raw data
      let appendixJson = buildRawAppendix(mergedCompanies as any[]);
      if (appendixJson.includes("...truncated...")) {
        const relevant = selectRelevantCompanies(userText, mergedCompanies);
        appendixJson = buildDataAppendix(relevant);
      }

      setWebBusy(useWeb);
      const systemInstruction = buildSystemInstruction({
        carbonPrice,
        companies: mergedCompanies,
        appendixJson,
      });

      const { text: answer, sources: cited, modelUsed } = await callGeminiREST({
        history: messages,
        userText,
        systemInstruction,
        enableWeb: useWeb,
      });
      setWebBusy(false);
      setLastSources(cited);
      setLastModel(modelUsed);
      const withSources =
        answer +
        (cited && cited.length
          ? `\n\nSources:\n${cited.map((s, i) => `${i + 1}. ${s.title} — ${s.url}`).join("\n")}`
          : "");
      setMessages((m) => [...m, { role: "model", text: withSources }]);
    } catch (e: any) {
      const msg = e?.message || "Unknown error";
      setErrorMsg(msg);
      setMessages((m) => [...m, { role: "model", text: "I couldn't complete that request." }]);
      console.error("Gemini API error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI Chat</h2>
        <span className="ml-auto text-xs text-muted-foreground">Model: {lastModel}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setUseWeb((v) => !v)}
          className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border ${
            useWeb ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
          title="Use Gemini's web search for fresher context and citations"
        >
          <Globe className="h-4 w-4" />
          {useWeb ? "Web: On" : "Web: Off"}
        </button>
        {webBusy && (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            searching…
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <div className="text-destructive">{errorMsg}</div>
        </div>
      )}

      <Card className="h-[60vh] md:h-[68vh] flex flex-col overflow-hidden">
        <div ref={scroller} className="flex-1 overflow-auto px-4 py-4 space-y-4 bg-gradient-to-b from-muted/30 to-background">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "model" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                } whitespace-pre-wrap break-words`}
              >
                {m.role === "model" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: (props) => <a {...props} className="underline" target="_blank" rel="noreferrer" />,
                      code: ({ inline, children, ...p }) =>
                        inline ? (
                          <code {...p} className="px-1 rounded bg-muted text-foreground">{children}</code>
                        ) : (
                          <pre className="p-3 rounded bg-muted overflow-x-auto"><code>{children}</code></pre>
                        ),
                      ul: (p) => <ul {...p} className="list-disc list-inside space-y-1" />,
                      ol: (p) => <ol {...p} className="list-decimal list-inside space-y-1" />,
                      h1: (p) => <h1 {...p} className="text-base font-bold mt-2" />,
                      h2: (p) => <h2 {...p} className="text-base font-semibold mt-2" />,
                      h3: (p) => <h3 {...p} className="text-sm font-semibold mt-2" />,
                      p: (p) => <p {...p} className="my-2" />,
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-accent/10 text-accent-foreground grid place-items-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground px-1">Thinking…</div>}
        </div>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask a question… (Shift+Enter for newline)"
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 focus:outline-none"
            />
            <button
              disabled={!canSend}
              onClick={send}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 inline-flex items-center gap-2"
              title="Send"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </Card>

      {lastSources && lastSources.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium flex items-center gap-2">
            <LinkIcon className="h-3.5 w-3.5" />
            Recent sources
          </div>
          <ul className="list-disc list-inside">
            {lastSources.map((s, i) => (
              <li key={i}>
                <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                  [{i + 1}] {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Web mode uses Gemini’s Google Search grounding. For production, proxy the API to hide keys.
      </div>
    </div>
  );
}