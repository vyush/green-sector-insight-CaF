import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Company, EmissionAnalysis } from "@/types/company";
import { TrendingUp, DollarSign, Leaf, Building2 } from "lucide-react";

interface InvestorMetricsProps {
  company: Company;
  analysis: EmissionAnalysis;
}

export const InvestorMetrics = ({ company, analysis }: InvestorMetricsProps) => {
  const totalCapacity = company.plants.reduce((sum, plant) => sum + plant.capacity, 0);
  const latestEmissions = company.emissionHistory[company.emissionHistory.length - 1].emissions;
  const emissionIntensity = latestEmissions * 1000000000 / company.emissionHistory[company.emissionHistory.length - 1].physicalOutput;
  const emissionGrowthRate = ((1+((emissionIntensity - company.emissionHistory[0].intensityPerTonne) / company.emissionHistory[0].intensityPerTonne))**0.5 - 1)* 100;
  const priceToMarketCap = (company.currentSharePrice / (company.marketCap * 10000000 / company.currentSharePrice)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Emission Intensity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{emissionIntensity.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Kg CO₂ / Mt</p>
        </CardContent>
      </Card> 

      <Card className="border-border bg-gradient-to-br from-accent/5 to-accent/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            3-Year Emission Intensity Growth (CAGR)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${emissionGrowthRate > 0 ? 'text-warning' : 'text-success'}`}>
            {emissionGrowthRate > 0 ? '+' : ''}{emissionGrowthRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            FY {company.emissionHistory[0].year} - {company.emissionHistory[company.emissionHistory.length-1].year+1}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-success/5 to-success/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Total Production Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalCapacity.toFixed(1)} Mt</p>
          <p className="text-xs text-muted-foreground mt-1">Across {company.totalPlants} plants</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-warning/5 to-warning/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Market Cap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₹{company.marketCap.toLocaleString()} Cr</p>
          <p className="text-xs text-muted-foreground mt-1">As of latest data</p>
        </CardContent>
      </Card>
    </div>
  );
};
