import { Company } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { analyzeCompany } from "@/utils/analysisCalculations";
import { useNavigate } from "react-router-dom";

interface CompanyCardProps {
  company: Company;
  carbonPrice: number;
}

export const CompanyCard = ({ company, carbonPrice }: CompanyCardProps) => {
  const navigate = useNavigate();
  const analysis = analyzeCompany(company, carbonPrice);
  const isPositive = analysis.gap > 0;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-elevated border-border"
      onClick={() => navigate(`/company/${company.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{company.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{company.ticker}</p>
          </div>
          <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "Surplus" : "Shortfall"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold">₹{company.currentSharePrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold">₹{(company.marketCap / 1000).toFixed(0)}K Cr</p>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Emission Gap</p>
              <p className={`text-base font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {analysis.gap > 0 ? '+' : ''}{(analysis.gap/10**6).toFixed(2)} MMt
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P&L Impact</p>
              <p className={`text-base font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {analysis.estimatedSharePriceImpact > 0 ? '+' : ''}{analysis.plImpact.toFixed(2)}cr
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
