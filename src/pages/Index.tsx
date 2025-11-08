import { useState } from "react";
import { cementCompanies } from "@/data/companies";
import { CompanyCard } from "@/components/CompanyCard";
import { CarbonPriceInput } from "@/components/CarbonPriceInput";
import { BarChart3, TrendingUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Methodology from "./Methodology";
import CompanyX from "./CompanyX";
import MeetTheTeam from "./MeetTheTeam";
import GeminiChat from "./GeminiChat";

const Index = () => {
  const [carbonPrice, setCarbonPrice] = useState(9.5);
  const [activeTab, setActiveTab] = useState<"home" | "methodology" | "companyX" | "team" | "chat">("home");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-primary-foreground py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Carbon Compliance Tracker</h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl">
            Analyze cement sector emission compliance against government targets. 
            Empowering retail investors with transparent ESG insights.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            {[
              { key: "home", label: "Home" },
              { key: "methodology", label: "Methodology" },
              { key: "companyX", label: "Company X" },
              { key: "chat", label: "AI Chat" },
              { key: "team", label: "Meet the Team" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`relative -mb-px px-3 md:px-4 py-3 text-sm md:text-base font-medium transition-colors
                  ${activeTab === t.key ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
                <span
                  className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-all
                    ${activeTab === t.key ? "bg-primary" : "bg-transparent"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "home" && (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Info Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-4">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This platform analyzes 5 major cement companies against government emission reduction targets. 
                  Using 3-year BRSR emission data and plant-wise government gazette notifications, we predict 
                  2024 emissions and calculate potential P&L impacts based on carbon pricing. Our goal is to 
                  reduce information asymmetry for retail investors by providing data-driven ESG insights.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Carbon Price Configuration */}
          <CarbonPriceInput
            onPriceChange={setCarbonPrice}
            initialPrice={carbonPrice}
            min={0}
            max={200} // extend range to $200
            step={0.5}
            unit="USD/tCO2e"
            chinaProxy={9.5}
          />

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Companies Analyzed</p>
                    <p className="text-2xl font-bold">{cementCompanies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-success/10">
                    <BarChart3 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Plants</p>
                    <p className="text-2xl font-bold">
                      {cementCompanies.reduce((sum, c) => sum + c.plants.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Years</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Cards */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Company Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cementCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} carbonPrice={carbonPrice} />
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <Card className="border-border bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Future Roadmap</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Expand coverage to other high-emission sectors (Steel, Power, etc.)</li>
                <li>Real-time data integration with government portals</li>
                <li>Partnership opportunities with investment platforms like Zerodha</li>
                <li>Advanced machine learning models for emission predictions</li>
                <li>Custom alerts for significant compliance changes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "methodology" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Methodology />
        </div>
      )}

      {activeTab === "companyX" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <CompanyX />
        </div>
      )}

      {activeTab === "team" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <MeetTheTeam />
        </div>
      )}

      {activeTab === "chat" && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <GeminiChat carbonPrice={carbonPrice} companies={cementCompanies} />
        </div>
      )}
    </div>
  );
};

export default Index;
