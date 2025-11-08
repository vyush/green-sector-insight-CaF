import { Company } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";

interface CompanyProfileProps {
  company: Company;
}

export const CompanyProfile = ({ company }: CompanyProfileProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Founded</p>
              <p className="font-semibold">
                {company.foundedYear} ({new Date().getFullYear() - company.foundedYear} years)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-semibold">Cement, Clinker</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="font-semibold">{company.employees?.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Workers</p>
              <p className="font-semibold">{company.workers?.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Plants</p>
              <p className="font-semibold">{company.totalPlants}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="font-semibold">₹{company.revenue?.toLocaleString()} Cr</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue Growth</p>
              <p className="font-semibold text-green-600">{company.revenueGrowth}%</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="font-semibold">₹{company.netIncome?.toLocaleString()} Cr</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
