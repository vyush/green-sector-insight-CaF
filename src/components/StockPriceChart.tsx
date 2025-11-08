import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { Company, StockSeries } from "@/types/company";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

type TimeRange = "1W" | "1M" | "6M" | "1Y" | "3Y" | "5Y";

const TIME_RANGES: TimeRange[] = ["1W", "1M", "6M", "1Y", "3Y", "5Y"];
const LOOKBACK_DAYS: Record<TimeRange, number> = {
  "1W": 7,
  "1M": 30,
  "6M": 182,
  "1Y": 365,
  "3Y": 365 * 3,
  "5Y": 365 * 5,
};

interface StockPoint {
  date: Date;
  price: number;
}

interface ChartDatum {
  date: string;
  price: number;
}

function expandSeries(history?: StockSeries): StockPoint[] {
  if (!history || history.prices.length === 0) return [];
  return history.prices.map((price, index) => {
    const date = new Date(history.startDate);
    switch (history.frequency) {
      case "W":
        date.setDate(date.getDate() + index * 7);
        break;
      case "M":
        date.setMonth(date.getMonth() + index);
        break;
      default:
        date.setDate(date.getDate() + index);
        break;
    }
    return { date, price };
  });
}

function formatXAxisLabel(value: string, range: TimeRange, formatterCache: Map<string, Intl.DateTimeFormat>) {
  if (!formatterCache.has(range)) {
    formatterCache.set(
      range,
      new Intl.DateTimeFormat("en-IN", (() => {
        if (range === "1W" || range === "1M") return { day: "numeric", month: "short" };
        if (range === "6M") return { month: "short", year: "2-digit" };
        return { month: "short", year: "numeric" };
      })())
    );
  }
  return formatterCache.get(range)!.format(new Date(value));
}

const tooltipDateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

interface StockPriceChartProps {
  company: Company;
}

export const StockPriceChart = ({ company }: StockPriceChartProps) => {
  const [range, setRange] = useState<TimeRange>("6M");
  const formatterCache = useMemo(() => new Map<string, Intl.DateTimeFormat>(), []);

  const rawSeries = company.stockHistory ?? [];
  // expand compact StockSeries -> array of { date: Date, price: number }
  const expanded = useMemo(() => expandSeries(company.stockHistory), [company.stockHistory]);

  // Shift expanded series so last point lands on today (preserve spacing)
  const series = useMemo(() => {
    if (!expanded || expanded.length === 0) return [];
    const lastTime = expanded[expanded.length - 1].date.getTime();
    const delta = Date.now() - lastTime;
    return expanded.map((p) => ({ date: new Date(p.date.getTime() + delta), price: p.price }));
  }, [expanded]);

  // filter series by selected time range, then map to chart data strings
  const chartData = useMemo(() => {
    if (series.length === 0) return [];
    const days = LOOKBACK_DAYS[range] ?? LOOKBACK_DAYS["6M"];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filtered = series.filter((p) => p.date >= cutoff);
    // If filter removed everything (very short series), fall back to last N points preserving spacing
    const final = filtered.length > 0 ? filtered : series.slice(Math.max(0, series.length - Math.min(series.length, Math.ceil(days / 1))));
    return final.map((p) => ({ date: p.date.toISOString().slice(0, 10), price: p.price }));
  }, [series, range]);

  const { domainMin, domainMax } = useMemo(() => {
    if (chartData.length === 0) return { domainMin: 0, domainMax: 0 };
    const series = chartData.map((d) => d.price);
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = Math.max(max - min, Math.max(max, 1) * 0.02);
    return {
      domainMin: Math.max(min - span * 0.15, 0),
      domainMax: max + span * 0.15,
    };
  }, [chartData]);

  const latestPrice = chartData.at(-1)?.price ?? company.currentSharePrice;
  const firstPrice = chartData[0]?.price ?? latestPrice;
  const priceChange = latestPrice - firstPrice;
  const priceChangePct = firstPrice ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg md:text-xl">Stock Price Trend</CardTitle>
          <CardDescription>
            {company.ticker} · {range} view · Last close ₹
            {latestPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={option === range ? "default" : "outline"}
              onClick={() => setRange(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            ₹{Math.abs(priceChange).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {priceChangePct >= 0 ? "+" : ""}
            {priceChangePct.toFixed(2)}%)
          </div>
          {chartData.length > 0 && (
            <span className="text-xs text-muted-foreground">
              From {tooltipDateFormatter.format(new Date(chartData[0].date))} to{" "}
              {tooltipDateFormatter.format(new Date(chartData.at(-1)!.date))}
            </span>
          )}
        </div>

        <div className="h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 12, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={16}
                  tickFormatter={(value) => formatXAxisLabel(value, range, formatterCache)}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN", {
                      maximumFractionDigits: Number(value) >= 1000 ? 0 : 2,
                    })}`
                  }
                />
                <Tooltip
                  cursor={{ strokeDasharray: "4 4" }}
                  labelFormatter={(label) => tooltipDateFormatter.format(new Date(label))}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    "Close",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No historical price data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
