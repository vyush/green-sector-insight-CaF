import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, ReferenceLine,
} from "recharts";

type FormState = {
  name: string;
  intensityFY23: string;
  intensityFY24: string;
  intensityFY25: string;
  renewableSharePct: string;  // required
  employees: string;          // required

  plants?: string;
  revenueGrowthPct?: string;
  revenue?: string;
  income?: string;
  productionFY23T?: string; // total production (tonnes) FY23
  productionFY24T?: string; // total production (tonnes) FY24
  productionFY25T?: string; // total production (tonnes) FY25
  ageYears?: string;
};

function num(x: string | undefined) {
  const v = Number(x);
  return Number.isFinite(v) ? v : undefined;
}

// export default function CompanyX() {
//   const [form, setForm] = useState<FormState>({
//     name: "",
//     intensityFY23: "",
//     intensityFY24: "",
//     intensityFY25: "",
//     renewableSharePct: "",
//     employees: "",
//     plants: "",
//     revenueGrowthPct: "",
//     revenue: "",
//     income: "",
//     productionT: "",
//     ageYears: "",
//   });
export default function CompanyX() {
  const [form, setForm] = useState<FormState>({
    name: "Ramco Industries",
    intensityFY23: "591",
    intensityFY24: "615",
    intensityFY25: "578",
    renewableSharePct: "4.17",
    employees: "10865",
    plants: "12",
    revenueGrowthPct: "8",
    revenue: "80000",
    income: "9000",
    productionFY23T: "24000000",
    productionFY24T: "25000000",
    productionFY25T: "25000000",
    ageYears: "86",
  });

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push("Company Name");
    if (form.intensityFY23 === "" || form.intensityFY24 === "" || form.intensityFY25 === "") {
      missing.push("Emission intensities (FY23, FY24, FY25)");
    }
    if (form.renewableSharePct === "") missing.push("Renewable share %");
    if (form.employees === "") missing.push("Total Employees");
    return missing;
  }, [form]);

  const analysis = useMemo(() => {
    // Guard until required are present and valid numbers
    const i23 = num(form.intensityFY23);
    const i24 = num(form.intensityFY24);
    const i25 = num(form.intensityFY25);
    const rShare = num(form.renewableSharePct);
    const employees = num(form.employees);

    if ([i23, i24, i25, rShare, employees].some((v) => v === undefined)) return null;

    const seq = [i23!, i24!, i25!];
    const first = seq[0];
    const last = seq[seq.length - 1];
    const years = seq.length - 1; // 2 gaps (FY23->FY25)
    const overallChangePct = ((last - first) / first) * 100;

    // CAGR of intensity change across (years) transitions
    const cagr = Math.pow(last / first, 1 / years) - 1;

    // Simple linear projection one year ahead
    const avgStep = (seq[2] - seq[1] + seq[1] - seq[0]) / 2;
    const projectedNext = seq[2] + avgStep;

    // Reductions (positive = reduction, negative = increase)
    const reduction23to24 = i23! - i24!;
    const reduction24to25 = i24! - i25!;
    const reduction23to24Pct = (reduction23to24 / i23!) * 100;
    const reduction24to25Pct = (reduction24to25 / i24!) * 100;

    // CAGR computed from YoY reductions (factors multiply, then root by number of periods)
    // Factors: i24/i23 = 1 - YoY23_24_reduction%, i25/i24 = 1 - YoY24_25_reduction%
    const f23_24 = 1 - reduction23to24Pct / 100;
    const f24_25 = 1 - reduction24to25Pct / 100;
    const overallFactor = f23_24 * f24_25; // equals i25/i23
    const cagrFromYoY = Math.pow(overallFactor, 1 / years) - 1; // signed growth rate per year
    // Convert to "reduction %" convention (positive means reduction)
    const cagrYoYReductionPct = -cagrFromYoY * 100;
    // Use this constant YoY reduction% to project next two years
    const projYoYRed_25_26 = cagrYoYReductionPct;
    const projYoYRed_26_27 = cagrYoYReductionPct;
    const intensityFY26_CAGR = i25! * (1 - projYoYRed_25_26 / 100);
    const intensityFY27_CAGR = intensityFY26_CAGR * (1 - projYoYRed_26_27 / 100);

    // Per-year production and emissions (kgCO2/t * t)/1000 = tCO2
    const p23 = num(form.productionFY23T);
    const p24 = num(form.productionFY24T);
    const p25 = num(form.productionFY25T);
    const emissionsFY23_tCO2 = p23 !== undefined ? (i23! * p23) / 1000 : undefined;
    const emissionsFY24_tCO2 = p24 !== undefined ? (i24! * p24) / 1000 : undefined;
    const emissionsFY25_tCO2 = p25 !== undefined ? (i25! * p25) / 1000 : undefined;

    const emissionsPerEmployee_tCO2 =
      emissionsFY25_tCO2 !== undefined && employees! > 0 ? emissionsFY25_tCO2 / employees! : undefined;

    // Government target prediction models (your regressions)
    const yoy23_24 = reduction23to24Pct; // %
    const yoy24_25 = reduction24to25Pct; // %
    const Y1_pct =
      1.5863 + 0.0545 * yoy23_24 + 0.1427 * yoy24_25 + 0.0002 * rShare! - 5.364e-7 * employees!;
    const Y2_pct =
      1.1231 + 0.0833 * yoy23_24 + 0.0992 * yoy24_25 - 0.0060 * rShare! + 1.23e-6 * employees!;

    // Target intensities applying the predicted reductions
    const targetIntensityFY26 = i25! * (1 - Y1_pct / 100);
    const targetIntensityFY27 = targetIntensityFY26 * (1 - Y2_pct / 100);

    const plants = num(form.plants);
    const revenue = num(form.revenue);
    const income = num(form.income);
    const revGrowth = num(form.revenueGrowthPct);
    const nextYearRevenue = revenue !== undefined && revGrowth !== undefined
      ? revenue * (1 + revGrowth / 100)
      : undefined;
    const netMarginPct = revenue && income !== undefined ? (income / revenue) * 100 : undefined;

    const ageYears = num(form.ageYears);

    return {
      first,
      last,
      overallChangePct,
      cagrPct: cagr * 100,
      projectedNext,
      reduction23to24,
      reduction24to25,
      reduction23to24Pct,
      reduction24to25Pct,
      // CAGR-based YoY projections
      cagrYoYReductionPct,
      projYoYRed_25_26,
      projYoYRed_26_27,
      intensityFY26_CAGR,
      intensityFY27_CAGR,
      rShare,
      // emissions
      emissionsFY23_tCO2,
      emissionsFY24_tCO2,
      emissionsFY25_tCO2,
      emissionsPerEmployee_tCO2,
      // govt targets
      Y1_pct,
      Y2_pct,
      targetIntensityFY26,
      targetIntensityFY27,
      // ops/fin
      employees: employees!,
      plants,
      revenue,
      income,
      nextYearRevenue,
      netMarginPct,
      ageYears,
    };
  }, [form]);

  function set<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  // Build chart data when analysis is available
  const i23n = num(form.intensityFY23);
  const i24n = num(form.intensityFY24);
  const i25n = num(form.intensityFY25);
  const p25n = num(form.productionFY25T);

  const intensityChartData =
    analysis && i23n !== undefined && i24n !== undefined && i25n !== undefined
      ? [
          { year: "FY23", Actual: i23n, "Gov target": null, Projected: null },
          { year: "FY24", Actual: i24n, "Gov target": null, Projected: null },
          // seed FY25 for Gov/Projected so the lines start at FY25 and connect forward
          { year: "FY25", Actual: i25n, "Gov target": i25n, Projected: i25n },
          { year: "FY26", Actual: null, "Gov target": analysis.targetIntensityFY26, Projected: analysis.intensityFY26_CAGR },
          { year: "FY27", Actual: null, "Gov target": analysis.targetIntensityFY27, Projected: analysis.intensityFY27_CAGR },
        ]
      : [];

  const yoyChartData =
    analysis
      ? [
          { label: "FY23→FY24", Historical: analysis.reduction23to24Pct, "Gov target": null, Projected: null },
          { label: "FY24→FY25", Historical: analysis.reduction24to25Pct, "Gov target": null, Projected: null },
          { label: "FY25→FY26", Historical: null, "Gov target": analysis.Y1_pct, Projected: analysis.projYoYRed_25_26 },
          { label: "FY26→FY27", Historical: null, "Gov target": analysis.Y2_pct, Projected: analysis.projYoYRed_26_27 },
        ]
      : [];

  // Emissions (tCO2) using FY25 baseline production
  const baselineEmissionsFY25 =
    p25n !== undefined && i25n !== undefined ? (i25n * p25n) / 1000 : undefined;

  const emissionsChartData =
    analysis && baselineEmissionsFY25 !== undefined && p25n !== undefined
      ? [
          {
            year: "FY26",
            "Gov target": (analysis.targetIntensityFY26 * p25n) / 1000,
            Projected: (analysis.intensityFY26_CAGR * p25n) / 1000,
          },
          {
            year: "FY27",
            "Gov target": (analysis.targetIntensityFY27 * p25n) / 1000,
            Projected: (analysis.intensityFY27_CAGR * p25n) / 1000,
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Company X</h2>

      <Card className="border-border">
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm text-muted-foreground">
            Enter the company’s details. Required: Company Name, last 3 years’ emission intensity (FY23–FY25),
            Renewable share %, and Total Employees. Optional fields refine the analysis.
          </p>

          {/* Required fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder="Company X"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Employees *</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number"
                min={0}
                placeholder="e.g., 12000"
                value={form.employees}
                onChange={set("employees")}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Emission Intensity (kgCO2/t) — last 3 years *</label>
            <div className="grid gap-4 md:grid-cols-3 mt-2">
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01" placeholder="FY23"
                value={form.intensityFY23}
                onChange={set("intensityFY23")}
              />
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01" placeholder="FY24"
                value={form.intensityFY24}
                onChange={set("intensityFY24")}
              />
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01" placeholder="FY25"
                value={form.intensityFY25}
                onChange={set("intensityFY25")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Renewable Share (%) *</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.1" min={0} max={100}
                placeholder="e.g., 18.5"
                value={form.renewableSharePct}
                onChange={set("renewableSharePct")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Plants</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" min={0}
                placeholder="e.g., 12"
                value={form.plants}
                onChange={set("plants")}
              />
            </div>
          </div>

          {/* Optional financials and production */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Revenue (₹ Cr)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01"
                placeholder="e.g., 45000"
                value={form.revenue}
                onChange={set("revenue")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Income / Net Profit (₹ Cr)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01"
                placeholder="e.g., 3800"
                value={form.income}
                onChange={set("income")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Revenue Growth Rate (%)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="0.01"
                placeholder="e.g., 8.0"
                value={form.revenueGrowthPct}
                onChange={set("revenueGrowthPct")}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Total Production (t) — FY(23–25)</label>
            <div className="grid gap-4 md:grid-cols-3 mt-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">FY23</div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  type="number" step="1" min={0}
                  placeholder="e.g., 24,000,000"
                  value={form.productionFY23T}
                  onChange={set("productionFY23T")}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">FY24</div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  type="number" step="1" min={0}
                  placeholder="e.g., 25,000,000"
                  value={form.productionFY24T}
                  onChange={set("productionFY24T")}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">FY25</div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  type="number" step="1" min={0}
                  placeholder="e.g., 25,000,000"
                  value={form.productionFY25T}
                  onChange={set("productionFY25T")}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Age (years)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                type="number" step="1" min={0}
                placeholder="e.g., 86"
                value={form.ageYears}
                onChange={set("ageYears")}
              />
            </div>
          </div>

          {requiredMissing.length > 0 && (
            <div className="text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-md px-3 py-2">
              Missing: {requiredMissing.join(", ")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-lg font-semibold">Analysis</h3>

          {!analysis ? (
            <p className="text-sm text-muted-foreground">
              Enter all required fields to see analysis.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Emission Intensity Trend</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>FY23: {analysis.first.toFixed(2)} kgCO2/t → FY25: {analysis.last.toFixed(2)} kgCO2/t</li>
                  <li>Overall change: {analysis.overallChangePct >= 0 ? "+" : ""}{analysis.overallChangePct.toFixed(2)}%</li>
                  <li>CAGR: {analysis.cagrPct >= 0 ? "+" : ""}{analysis.cagrPct.toFixed(2)}%/yr</li>
                  <li>Projected next year: {analysis.projectedNext.toFixed(2)} kgCO2/t</li>
                  <li>Reduction FY23→FY24: {analysis.reduction23to24.toFixed(2)} kgCO2/t ({analysis.reduction23to24Pct >= 0 ? "+" : ""}{analysis.reduction23to24Pct.toFixed(2)}%)</li>
                  <li>Reduction FY24→FY25: {analysis.reduction24to25.toFixed(2)} kgCO2/t ({analysis.reduction24to25Pct >= 0 ? "+" : ""}{analysis.reduction24to25Pct.toFixed(2)}%)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Operational Snapshot</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Renewable share: {Number(form.renewableSharePct).toFixed(1)}%</li>
                  <li>Employees: {Number(form.employees).toLocaleString()}</li>
                  {analysis.plants !== undefined && <li>Plants: {analysis.plants}</li>}
                  {analysis.ageYears !== undefined && <li>Age: {analysis.ageYears} years</li>}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Emissions</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {analysis.emissionsFY23_tCO2 !== undefined && (
                    <li>FY23 emissions: {analysis.emissionsFY23_tCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO2</li>
                  )}
                  {analysis.emissionsFY24_tCO2 !== undefined && (
                    <li>FY24 emissions: {analysis.emissionsFY24_tCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO2</li>
                  )}
                  {analysis.emissionsFY25_tCO2 !== undefined && (
                    <li>FY25 emissions: {analysis.emissionsFY25_tCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO2</li>
                  )}
                  {analysis.emissionsFY25_tCO2 === undefined && (
                    <li>Provide Total Production for FY25 to estimate tCO2/employee.</li>
                  )}
                  {analysis.emissionsPerEmployee_tCO2 !== undefined && (
                    <li>Emissions per employee (FY25): {analysis.emissionsPerEmployee_tCO2.toFixed(2)} tCO2/employee</li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Financials</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {analysis.revenue !== undefined && <li>Revenue: ₹{analysis.revenue.toLocaleString()} Cr</li>}
                  {analysis.income !== undefined && <li>Income: ₹{analysis.income.toLocaleString()} Cr</li>}
                  {analysis.netMarginPct !== undefined && <li>Net margin: {analysis.netMarginPct.toFixed(2)}%</li>}
                  {analysis.nextYearRevenue !== undefined && (
                    <li>Next-year revenue (at {Number(form.revenueGrowthPct || 0).toFixed(2)}%): ₹{analysis.nextYearRevenue.toLocaleString()} Cr</li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Government Targets (Predicted)</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>
                    Y1 (FY25→FY26) reduction target: {analysis.Y1_pct >= 0 ? "+" : ""}
                    {analysis.Y1_pct.toFixed(2)}%
                  </li>
                  <li>
                    Target intensity FY26: {analysis.targetIntensityFY26.toFixed(2)} kgCO2/t
                  </li>
                  <li>
                    Y2 (FY26→FY27) reduction target: {analysis.Y2_pct >= 0 ? "+" : ""}
                    {analysis.Y2_pct.toFixed(2)}%
                  </li>
                  <li>
                    Target intensity FY27: {analysis.targetIntensityFY27.toFixed(2)} kgCO2/t
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">CAGR-based Projections</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>YoY reduction (CAGR): {analysis.cagrYoYReductionPct >= 0 ? "+" : ""}{analysis.cagrYoYReductionPct.toFixed(2)}%</li>
                  <li>Projected FY25→FY26 YoY reduction: {analysis.projYoYRed_25_26 >= 0 ? "+" : ""}{analysis.projYoYRed_25_26.toFixed(2)}%</li>
                  <li>Projected FY26→FY27 YoY reduction: {analysis.projYoYRed_26_27 >= 0 ? "+" : ""}{analysis.projYoYRed_26_27.toFixed(2)}%</li>
                  <li>Projected intensity FY26 (CAGR): {analysis.intensityFY26_CAGR.toFixed(2)} kgCO2/t</li>
                  <li>Projected intensity FY27 (CAGR): {analysis.intensityFY27_CAGR.toFixed(2)} kgCO2/t</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      {analysis && (
        <Card className="border-border">
          <CardContent className="pt-6 space-y-8">
            {/* Intensity chart */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Emission Intensity (kgCO2/t)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={intensityChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip
                      formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(2)} kgCO2/t`)}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={2} dot connectNulls />
                    <Line type="monotone" dataKey="Gov target" stroke="#16a34a" strokeWidth={2} dot connectNulls />
                    {/* Projected: same color as Actual, dotted (short dash pattern) */}
                    <Line
                      type="monotone"
                      dataKey="Projected"
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* YoY reductions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">YoY Reduction (%)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoyChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(v: any) => (v == null ? "—" : `${Number(v).toFixed(2)}%`)} />
                    <Legend />
                    <Bar dataKey="Historical" fill="#2563eb" />
                    <Bar dataKey="Gov target" fill="#16a34a" />
                    <Bar dataKey="Projected" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emissions with FY25 baseline */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Predicted Emissions (tCO2) — FY25 Baseline</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsChartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(v: any) =>
                        v == null ? "—" : `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO2`
                      }
                    />
                    <Legend />
                    {baselineEmissionsFY25 !== undefined && (
                      <ReferenceLine
                        y={baselineEmissionsFY25}
                        label="FY25 baseline"
                        stroke="#94a3b8"
                        strokeDasharray="6 6"
                      />
                    )}
                    <Bar dataKey="Gov target" fill="#16a34a" />
                    <Bar dataKey="Projected" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}