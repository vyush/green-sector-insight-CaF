import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Company } from "@/types/company";
import { analyzeCompany, calculateWeightedTarget } from "@/utils/analysisCalculations";
import { Users } from "lucide-react";

interface PeerComparisonProps {
  companies: Company[];
  currentCompanyId: string;
  carbonPrice: number;
}

export const PeerComparison = ({ companies, currentCompanyId, carbonPrice }: PeerComparisonProps) => {
  // Calculate emission intensity (emissions per unit of capacity) for each company
  const peerData = companies.map(company => {
    const analysis = analyzeCompany(company, carbonPrice);
    const totalCapacity = company.plants.reduce((sum, plant) => sum + plant.capacity, 0);
    const targetReduction = calculateWeightedTarget(company);
    const latestEmissions = company.emissionHistory[company.emissionHistory.length - 1].emissions;
    const emissionIntensity = latestEmissions * 1000000000 / company.emissionHistory[company.emissionHistory.length - 1].physicalOutput;
    return {
      name: company.name.split(' ')[0], // Short name for chart
      fullName: company.name,
      emissionIntensity: parseFloat(emissionIntensity.toFixed(2)),
      targetReduction: parseFloat(targetReduction.toFixed(1)),
      emissions: parseFloat(latestEmissions.toFixed(2)),
      gap: parseFloat(analysis.gap.toFixed(2)),
      isCurrent: company.id === currentCompanyId,
    };
  });

  // Sort by emission intensity
  const sortedByIntensity = [...peerData].sort((a, b) => a.emissionIntensity - b.emissionIntensity);

  // Build signed emission gap data for FY 25-26 (positive = surplus, negative = shortfall)
  // Gap (MtCO2) = (govtTargetIntensity - projectedIntensity) * production_tonnes / 1e9
  const gapData = companies.map(company => {
    const fy26 = company.intensityProjections?.find(p => p.year === 2026);
    const productionTonnes =
      company.emissionHistory?.[company.emissionHistory.length - 1]?.physicalOutput ?? 0;

    const projectedIntensity = fy26?.projected ?? 0;     // kgCO2/tonne
    const govtTargetIntensity = fy26?.govtTarget ?? 0;   // kgCO2/tonne

    const signedGapMt = ((govtTargetIntensity - projectedIntensity) * productionTonnes) / 1_000_000_000;

    return {
      name: company.name.split(" ")[0],
      fullName: company.name,
      gap: Number(signedGapMt.toFixed(2)),
      isCurrent: company.id === currentCompanyId,
    };
  });

  return (
    <div className="space-y-6">
      {/* Emission Intensity Comparison */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Emission Intensity Comparison
          </CardTitle>
          <CardDescription>CO₂ emissions per unit capacity (Mt CO₂ / Mt capacity)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedByIntensity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'emissionIntensity') {
                    return [value, `${props.payload.fullName}: ${value} Mt/Mt`];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                dataKey="emissionIntensity" 
                fill="hsl(var(--primary))" 
                name="Emission Intensity"
                shape={(props: any) => {
                  const fill = props.payload.isCurrent ? 'hsl(var(--accent))' : 'hsl(var(--primary))';
                  return <rect {...props} fill={fill} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Lower intensity indicates better emission efficiency. Current company highlighted.
          </p>
        </CardContent>
      </Card>

      {/* Target Reduction Comparison */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Government Reduction Targets
          </CardTitle>
          <CardDescription>Weighted average reduction targets by company over 2 years</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Target (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'targetReduction') {
                    return [`${value}%`, props.payload.fullName];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                dataKey="targetReduction" 
                fill="hsl(var(--success))" 
                name="Reduction Target (%)"
                shape={(props: any) => {
                  const fill = props.payload.isCurrent ? 'hsl(var(--warning))' : 'hsl(var(--success))';
                  return <rect {...props} fill={fill} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Higher targets indicate stricter government compliance requirements.
          </p>
        </CardContent>
      </Card>

      {/* Emission Gap Comparison */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            FY 25-26 Emission Gap vs Targets
          </CardTitle>
          <CardDescription>Predicted shortfall or surplus compared to government targets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: 'Gap (Mt CO₂)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                formatter={(value: number, _name: string, props: any) => {
                  const status = value > 0 ? 'Surplus' : 'Shortfall';
                  return [`${value} Mt (${status})`, props.payload.fullName];
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />

              {/* Use default Bar with Cells to handle negative values correctly */}
              <Bar dataKey="gap" name="Emission Gap (Mt)">
                {gapData.map((d, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={d.gap >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    stroke={d.isCurrent ? 'hsl(var(--foreground))' : undefined}
                    strokeWidth={d.isCurrent ? 1 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Positive values indicate surplus (better than target), negative indicates shortfall. Current company highlighted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
