import { useParams, useNavigate } from "react-router-dom";
import { cementCompanies } from "@/data/companies";
import { useEffect, useMemo, useState } from "react";
import {
  analyzeCompany,
  calculateWeightedTarget,
  calculatePLImpact,
} from "@/utils/analysisCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Factory, Target, BarChart3, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { StockPriceChart } from "@/components/StockPriceChart";
import { PeerComparison } from "@/components/PeerComparison";
import { InvestorMetrics } from "@/components/InvestorMetrics";
import { CompanyProfile } from "@/components/CompanyProfile";
import { CarbonMetrics } from "@/components/CarbonMetrics";
import { IntensityProjectionChart } from "@/components/IntensityProjectionChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TooltipProps } from "recharts";
import { getBrsrUrl } from "@/data/brsrMap";

const DEFAULT_CARBON_PRICE = 9.5;

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carbonPrice, setCarbonPrice] = useState(DEFAULT_CARBON_PRICE);
  const [customGap, setCustomGap] = useState<number | null>(null);

  const company = cementCompanies.find((c) => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <p>Company not found</p>
        </div>
      </div>
    );
  }

  const analysis = useMemo(() => analyzeCompany(company, carbonPrice), [company, carbonPrice]);
  const defaultGap = 100;
  const defaultOutput = company.emissionHistory[2].physicalOutput / 100;
  const defaultIntensityGap = (company.intensityProjections[0].govtTarget - company.intensityProjections[0].projected)/1000;
  const targetReduction = calculateWeightedTarget(company);
  const isPositive = analysis.gap > 0;

  useEffect(() => {
    setCustomGap(defaultGap);
  }, [defaultGap, company.id]);

  const effectiveGap = customGap ?? defaultGap;
  const gapRange = Math.max(0.5, Math.abs(defaultGap) * 2);
  const gapSliderMin = Math.abs(defaultGap)*0.5;
  const gapSliderMax = gapRange;

  const plImpactSigned = useMemo(() => {
    const plImpactAbs = calculatePLImpact(Math.abs((effectiveGap*defaultOutput*defaultIntensityGap)), carbonPrice);
    return (effectiveGap*defaultOutput*defaultIntensityGap) >= 0 ? plImpactAbs : -plImpactAbs;
  }, [(effectiveGap*defaultOutput*defaultIntensityGap), carbonPrice]);

  const displayGapMt = `${effectiveGap >= 0 ? "+" : ""}${effectiveGap.toFixed(2)} %`;
  // Removed legacy share price impact (no longer used)
  const resetToDefaults = () => {
    setCarbonPrice(DEFAULT_CARBON_PRICE);
    setCustomGap(defaultGap);
  };

  // Helper to format FY labels
  const fy = (year: number) => `FY ${year - 2000}-${year - 1999}`;

  // Build Emission Trends & Predictions from intensity × physical output (Mt CO₂)
  const history = company.emissionHistory;
  const latest = history[history.length - 1];

  // Convert kgCO₂ (intensity × tonnes) to Mt CO₂
  const toMt = (tonnes: number, intensityKgPerTonne: number) => (tonnes * intensityKgPerTonne) / 1_000_000_000;

  // Historical actual emissions from intensity × physical output
  const actualSeries = history.map((d) => ({
    year: fy(d.year),
    actual: toMt(d.physicalOutput, d.intensityPerTonne),
  }));

  // Use latest year's physical output for forward projections
  const latestPhysicalOutput = latest.physicalOutput;

  // Get projected/target intensities if present; otherwise fall back to defaults
  const projectedIntensityY1 =
    Math.round(company.intensityProjections?.[0]?.projected ?? 486);
  const projectedIntensityY2 =
    Math.round(company.intensityProjections?.[1]?.projected ?? 467);

  const targetIntensityY1 =
    Math.round(company.intensityProjections?.[0]?.govtTarget ?? latest.intensityPerTonne * (1 - 0.0238));
  const targetIntensityY2 =
    Math.round(company.intensityProjections?.[1]?.govtTarget ?? Math.round(targetIntensityY1 * (1 - 0.0161)));

  // Convert projections/targets to Mt using latest physical output
  const predictedY1Mt = toMt(latestPhysicalOutput, projectedIntensityY1);
  const predictedY2Mt = toMt(latestPhysicalOutput, projectedIntensityY2);
  const targetY1Mt = toMt(latestPhysicalOutput, targetIntensityY1);
  const targetY2Mt = toMt(latestPhysicalOutput, targetIntensityY2);

  const lastActualMt = toMt(latest.physicalOutput, latest.intensityPerTonne);

  // Add a filtered tooltip to hide connector series in hover
  type ValueType = number | string | Array<number | string>;
  type NameType = string;
  const FilteredTooltip = ({ active, label, payload }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) return null;
    const items = payload.filter(
      (p: any) => p && p.dataKey && !String(p.dataKey).toLowerCase().includes("connect") && p.value != null
    );
    if (items.length === 0) return null;
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
        <div className="mb-1 font-medium">{label}</div>
        <ul className="space-y-1">
          {items.map((p: any) => (
            <li key={String(p.dataKey)} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
              <span className="font-medium">{Number(p.value).toFixed(2)} Mt</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const emissionChartData = [
    ...history.map((d, idx) => ({
      year: fy(d.year),
      actual: toMt(d.physicalOutput, d.intensityPerTonne),
      predicted: null as number | null,
      target: null as number | null,
      // put a value on the last actual point so the connector draws
      predictedConnect: idx === history.length - 1 ? lastActualMt : null,
      targetConnect: idx === history.length - 1 ? lastActualMt : null,
    })),
    // FY 25-26
    {
      year: fy(latest.year + 1),
      actual: null,
      predicted: predictedY1Mt,
      target: targetY1Mt,
      // second endpoint for connectors
      predictedConnect: predictedY1Mt,
      targetConnect: targetY1Mt,
    },
    // FY 26-27
    {
      year: fy(latest.year + 2),
      actual: null,
      predicted: predictedY2Mt,
      target: targetY2Mt,
      predictedConnect: null,
      targetConnect: null,
    },
  ];

  const plantData = company.plants.map((plant) => ({
    name: plant.name.split(" ")[0],
    capacity: plant.capacity,
    target: plant.governmentTarget,
  }));

  const effectiveGapPct = useMemo(() => {
    if (!analysis.targetEmissions) return 0;
    return ((effectiveGap*defaultOutput*defaultIntensityGap) / analysis.targetEmissions) * 100;
  }, [(effectiveGap*defaultOutput*defaultIntensityGap), analysis.targetEmissions]);

  // Inline BRSR URL fallback: place PDF at public/brsr/{id}.pdf
  const brsrUrl = getBrsrUrl(id);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{company.name}</h1>
            <p className="text-xl text-muted-foreground mt-2">{company.ticker}</p>
          </div>
          <Badge variant={isPositive ? "default" : "destructive"} className="gap-1 text-lg px-4 py-2">
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            {isPositive ? "Emission Surplus" : "Emission Shortfall"}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Share Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{company.currentSharePrice.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className={`border-0 ${isPositive ? "bg-gradient-accent" : "bg-gradient-destructive"} text-white`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Emission Gap (FY 2025 - 2026)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">
                  {(effectiveGap*defaultOutput*defaultIntensityGap) >= 0 ? "+" : ""}
                  {(effectiveGap*defaultOutput*defaultIntensityGap/10**6).toFixed(2)} MMt
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {Math.abs(effectiveGapPct).toFixed(1)}% vs target
                </p>
              </div>
              <div className="space-y-3 text-white">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>% of FY 24-25 Output </span>
                  <span>{displayGapMt}</span>
                </div>
                <Slider
                  value={[effectiveGap]}
                  min={gapSliderMin}
                  max={gapSliderMax}
                  step={0.01}
                  onValueChange={(val) => setCustomGap(val[0] ?? defaultGap)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/95 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">P&amp;L Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className={`text-2xl font-semibold ${plImpactSigned >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {plImpactSigned >= 0 ? "+" : "-"}₹{Math.abs(plImpactSigned).toLocaleString("en-IN")} Cr
                </div>
                <p className="text-xs text-muted-foreground">
                  @ ${carbonPrice.toFixed(1)}/tonne CO₂ · Physical Output (Tonne): {(effectiveGap*defaultOutput).toFixed(0)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Carbon Price ($/tonne CO₂)</span>
                  <span>${carbonPrice.toFixed(1)}</span>
                </div>
                <Slider value={[carbonPrice]} min={0} max={200} step={0.5} onValueChange={(val) => setCarbonPrice(val[0] ?? 0)} />
              </div>
            </CardContent>
          </Card>

          {/* Replace Est. Share Price Impact with BRSR report + keep Reset button */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">BRSR report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Official disclosure (opens PDF)</p>
                {brsrUrl ? (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a href={brsrUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                      Open PDF
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Place the PDF at public/brsr/{id}.pdf or map it in src/data/brsrMap.ts
                  </span>
                )}
              </div>

              {/* Keep reset control in this card (unchanged behavior) */}
              <Button size="sm" variant="outline" onClick={resetToDefaults}>
                Reset to original values
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Company Profile */}
        <CompanyProfile company={company} />

        {/* Investor Metrics Dashboard */}
        <InvestorMetrics company={company} analysis={analysis} />

        {/* Stock Price Chart */}
        <StockPriceChart company={company} />

        {/* Tabbed Section for Charts and Peer Comparison */}
        <Tabs defaultValue="emission-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emission-analysis">Emission Analysis</TabsTrigger>
            <TabsTrigger value="peer-comparison">Peer Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emission-analysis" className="space-y-6">
            {/* Carbon Metrics */}
            <CarbonMetrics company={company} />

            {/* Intensity Projection */}
            <IntensityProjectionChart company={company} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Emission Trends & Predictions
              </CardTitle>
              <CardDescription>Historical emissions vs. government targets and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emissionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    label={{ value: 'Emissions (Mt CO₂)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(v) => Number(v).toFixed(1)}
                  />
                  <Tooltip content={<FilteredTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    name="Actual" 
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predictedConnect" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false}
                    legendType="none"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={{ r: 4 }}
                    name="Predicted"
                    connectNulls={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetConnect" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2} 
                    strokeDasharray="3 3" 
                    dot={false}
                    legendType="none"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2} 
                    strokeDasharray="3 3" 
                    dot={{ r: 4 }}
                    name="Gov. Target"
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Plant-wise Analysis
              </CardTitle>
              <CardDescription>Capacity and government reduction targets by plant</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={plantData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: 'Capacity (Mt)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Target (%)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="capacity" fill="hsl(var(--primary))" name="Capacity (Mt)" />
                  <Bar yAxisId="right" dataKey="target" fill="hsl(var(--accent))" name="Reduction Target (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Plant Details */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Government Targets by Plant
            </CardTitle>
            <CardDescription>
              Weighted average reduction target over 2 years (combined): <span className="font-semibold">{targetReduction.toFixed(1)}%</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {company.plants.map((plant) => (
                <div key={plant.name} className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold">{plant.name}</h4>
                  <p className="text-sm text-muted-foreground">{plant.location}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-lg font-semibold">{plant.capacity} Mt</p>
                    <p className="text-xs text-muted-foreground mt-2">Reduction Target</p>
                    <p className="text-lg font-semibold text-primary">{plant.governmentTarget.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="peer-comparison">
            <PeerComparison 
              companies={cementCompanies} 
              currentCompanyId={company.id}
              carbonPrice={carbonPrice}
            />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This analysis is based on publicly available BRSR data and government gazette notifications. 
              Share price impact estimates use simplified models and may not reflect actual market movements, as regulatory changes 
              may already be priced into current valuations. Carbon pricing is based on China ETS proxy. This tool is designed to 
              reduce information asymmetry for retail investors and should not be considered investment advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDetail;
