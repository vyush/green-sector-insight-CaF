import { useMemo, useState, type CSSProperties } from "react";
import { Company, EmissionData } from "@/types/company";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, LineChart as LineChartIcon, Table as TableIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

interface CarbonMetricsProps {
  company: Company;
}

type MetricKey = "physicalOutput" | "scope1" | "scope2" | "intensityPerTonne";

interface MetricOption {
  value: MetricKey;
  label: string;
  unit: string;
  accessor: (data: EmissionData) => number;
  tickFormatter: (value: number) => string;
  tooltipFormatter: (value: number) => string;
}

const METRIC_OPTIONS: MetricOption[] = [
  {
    value: "physicalOutput",
    label: "Physical Output (Tonne)",
    unit: "Tonnes",
    accessor: (d) => d.physicalOutput,
    tickFormatter: (value) => value.toLocaleString("en-IN"),
    tooltipFormatter: (value) => `${value.toLocaleString("en-IN")} tonnes`,
  },
  {
    value: "scope1",
    label: "Scope 1 Emissions (tCO₂)",
    unit: "tCO₂",
    accessor: (d) => d.scope1,
    tickFormatter: (value) => value.toLocaleString("en-IN"),
    tooltipFormatter: (value) => `${value.toLocaleString("en-IN")} tCO₂`,
  },
  {
    value: "scope2",
    label: "Scope 2 Emissions (tCO₂)",
    unit: "tCO₂",
    accessor: (d) => d.scope2,
    tickFormatter: (value) => value.toLocaleString("en-IN"),
    tooltipFormatter: (value) => `${value.toLocaleString("en-IN")} tCO₂`,
  },
  {
    value: "intensityPerTonne",
    label: "Intensity per Tonne (kgCO₂/tonne)",
    unit: "kgCO₂/tonne",
    accessor: (d) => d.intensityPerTonne,
    tickFormatter: (value) => value.toLocaleString("en-IN"),
    tooltipFormatter: (value) => `${value.toLocaleString("en-IN")} kgCO₂/tonne`,
  },
];

const containerStyle: CSSProperties = { perspective: "1200px" };
const innerStyle = (flipped: boolean): CSSProperties => ({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
  transition: "transform 0.6s ease",
  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
});
const faceStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const CarbonMetrics = ({ company }: CarbonMetricsProps) => {
  const [isChartView, setIsChartView] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("physicalOutput");

  const metric = METRIC_OPTIONS.find((option) => option.value === selectedMetric)!;

  const chartData = useMemo(
    () =>
      company.emissionHistory.map((entry) => ({
        fy: `FY ${entry.year - 2000}-${entry.year - 1999}`,
        value: metric.accessor(entry),
      })),
    [company.emissionHistory, metric]
  );

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Carbon Metrics (Previous 3 Years)
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                Historical physical output, Scope 1 &amp; 2 emissions, and emissions intensity for the past three fiscal years.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>Track historical production and emissions performance</CardDescription>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsChartView((prev) => !prev)} className="gap-2">
          {isChartView ? (
            <>
              <TableIcon className="h-4 w-4" />
              View Table
            </>
          ) : (
            <>
              <LineChartIcon className="h-4 w-4" />
              View Chart
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {/* Fixed height ensures both faces have measurable size */}
        <div className="relative w-full h-[380px]" style={containerStyle}>
          <div style={innerStyle(isChartView)}>
            {/* Table face */}
            <div style={faceStyle}>
              <div className="h-full overflow-auto rounded-lg border border-border/60 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-1/4">Metric</TableHead>
                      {company.emissionHistory.map((entry) => (
                        <TableHead key={entry.year} className="text-right">
                          FY {entry.year - 2000}-{entry.year - 1999}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Physical Output (Tonne)</TableCell>
                      {company.emissionHistory.map((entry) => (
                        <TableCell key={entry.year} className="text-right">
                          {entry.physicalOutput.toLocaleString("en-IN")}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Scope 1 Emissions (tCO₂)</TableCell>
                      {company.emissionHistory.map((entry) => (
                        <TableCell key={entry.year} className="text-right">
                          {entry.scope1.toLocaleString("en-IN")}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Scope 2 Emissions (tCO₂)</TableCell>
                      {company.emissionHistory.map((entry) => (
                        <TableCell key={entry.year} className="text-right">
                          {entry.scope2.toLocaleString("en-IN")}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Intensity per Tonne (kgCO₂/tonne)</TableCell>
                      {company.emissionHistory.map((entry) => (
                        <TableCell key={entry.year} className="text-right">
                          {entry.intensityPerTonne.toLocaleString("en-IN")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Chart face */}
            <div
              style={{ ...faceStyle, transform: "rotateY(180deg)" }}
              className="gap-4 rounded-lg border border-border/60 bg-card/95 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">Interactive view for selected metric</p>
                </div>
                <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricKey)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-[240px]">
                {/* key includes flip state to force Recharts to recalc after transform */}
                <ResponsiveContainer key={`${selectedMetric}-${isChartView}`} width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="fy" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={metric.tickFormatter} />
                    <ReTooltip
                      formatter={(value: number) => metric.tooltipFormatter(value)}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { CarbonMetrics };
