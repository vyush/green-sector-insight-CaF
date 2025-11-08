import { useMemo } from "react";
import { Company } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import { predictIntensityForYear } from "@/utils/analysisCalculations";

type ValueType = number | string | Array<number | string>;
type NameType = string;

// Tooltip that hides any series whose key contains "bridge"
const FilteredTooltip = ({ active, label, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || payload.length === 0) return null;
  const items =
    payload.filter(
      (p: any) =>
        p &&
        p.dataKey &&
        !String(p.dataKey).toLowerCase().includes("bridge") &&
        p.value != null
    ) ?? [];
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium">{label}</div>
      <ul className="space-y-1">
        {items.map((p: any) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
            <span className="font-medium">
              {Number(p.value).toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface IntensityProjectionChartProps {
  company: Company;
}

const fy = (year: number) => `FY ${year - 2000}-${year - 1999}`;

export const IntensityProjectionChart = ({ company }: IntensityProjectionChartProps) => {
  const history = company.emissionHistory.filter((h) => typeof h.intensityPerTonne === "number");
  if (history.length === 0) return null;

  const latest = history[history.length - 1];
  const first = history[0];
  const latestYear = latest.year;
  const latestIntensity = latest.intensityPerTonne!;

  // projections/targets (fallbacks if missing)
  const proj1 = Math.round(
    company.intensityProjections?.[0]?.projected ?? predictIntensityForYear(company, 1)
  );
  const proj2 = Math.round(
    company.intensityProjections?.[1]?.projected ?? predictIntensityForYear(company, 2)
  );
  const tgt1 = Math.round(
    company.intensityProjections?.[0]?.govtTarget ?? latestIntensity * (1 - 0.0238)
  );
  const tgt2 = Math.round(
    company.intensityProjections?.[1]?.govtTarget ?? Math.round(tgt1 * (1 - 0.0161))
  );

  // YoY + CAGR
  const yoy = history.map((h, i) =>
    i === 0 ? null : ((h.intensityPerTonne! - history[i - 1].intensityPerTonne!) / history[i - 1].intensityPerTonne!) * 100
  );
  const periods = Math.max(history.length - 1, 1);
  const cagr = Math.pow(latestIntensity / first.intensityPerTonne!, 1 / periods) - 1;

  // data with bridge segments to connect last actual → first proj/target
  const chartData = [
    ...history.map((h, i) => ({
      year: fy(h.year),
      actual: h.intensityPerTonne!,
      projected: null as number | null,
      target: null as number | null,
      projectedBridge: i === history.length - 1 ? h.intensityPerTonne! : null,
      targetBridge: i === history.length - 1 ? h.intensityPerTonne! : null,
    })),
    {
      year: fy(latestYear + 1),
      actual: null,
      projected: proj1,
      target: tgt1,
      projectedBridge: proj1,
      targetBridge: tgt1,
    },
    {
      year: fy(latestYear + 2),
      actual: null,
      projected: proj2,
      target: tgt2,
      projectedBridge: null,
      targetBridge: null,
    },
  ];

  // Y domain with padding
  const { yMin, yMax } = useMemo(() => {
    const vals = [...history.map((h) => h.intensityPerTonne!), proj1, proj2, tgt1, tgt2];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = Math.max(max - min, max * 0.05);
    const pad = span * 0.15;
    return { yMin: Math.max(0, Math.floor(min - pad)), yMax: Math.ceil(max + pad) };
  }, [history, proj1, proj2, tgt1, tgt2]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emission Intensity Projection</CardTitle>
        <CardDescription>Historical, projected and govt targets (kgCO₂/tonne)</CardDescription>

        {/* YoY chips */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {history.map((h, i) =>
            i > 0 ? (
              <span
                key={h.year}
                className={`rounded-md px-2 py-1 ${
                  (yoy[i] ?? 0) <= 0
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                {fy(h.year)}: {(yoy[i] ?? 0).toFixed(2)}%
              </span>
            ) : null
          )}
        </div>

        <div className="mt-1 text-sm">
          <span className="text-muted-foreground">Avg. Reduction (CAGR): </span>
          <span className={`font-medium ${cagr <= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {(cagr * 100).toFixed(2)}%/yr
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" minTickGap={16} />
              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={(v) => `${v}`}
                label={{ value: "kgCO₂/tonne", angle: -90, position: "insideLeft" }}
              />
              {/* Tooltip */}
              <ReTooltip content={<FilteredTooltip />} />
              <Legend />

              {/* Actual */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
              />

              {/* Bridge lines (hidden from legend) */}
              <Line
                type="monotone"
                dataKey="projectedBridge"
                stroke="hsl(var(--chart-2, var(--primary)))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                legendType="none"
                connectNulls
                name=""
              />
              <Line
                type="monotone"
                dataKey="targetBridge"
                stroke="hsl(var(--chart-3, var(--muted-foreground)))"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                legendType="none"
                connectNulls
                name=""
              />

              {/* Future series */}
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="hsl(var(--chart-2, var(--primary)))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Govt Target"
                stroke="hsl(var(--chart-3, var(--muted-foreground)))"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
