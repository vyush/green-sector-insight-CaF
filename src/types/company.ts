export type Frequency = "D" | "W" | "M";

export interface StockSeries {
  startDate: string;        // e.g., "2019-01-01" (YYYY-MM-DD)
  frequency: Frequency;     // "D"
  currency?: "INR" | "USD";
  prices: number[];         // closing prices in sequence
}

export interface IntensityProjection {
  year: number;             // e.g., 2025 for FY2025-26
  projected: number;        // kgCO2/tonne
  govtTarget: number;       // kgCO2/tonne
}

export interface EmissionData {
  year: number;               // 2022 for FY2022-23, etc.
  emissions: number;          // Mt (S1+S2)
  scope1: number;             // tCO2
  scope2: number;             // tCO2
  physicalOutput: number;     // tonnes
  intensityPerTonne: number;  // kgCO2/tonne
  intensityPerINR?: number;   // kgCO2/INR
}

export interface Plant {
  name: string;
  location: string;
  capacity: number;           // MTPA
  governmentTarget: number;   // %
  // Optional plant-level data (CCTS)
  plantCode?: string;
  baselineOutput?: number;        // tonnes
  baselineIntensity?: number;     // tCO2/tonne (or tCO2 per unit)
  targetIntensity2025?: number;
  targetIntensity2026?: number;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  currentSharePrice: number;
  marketCap?: number;
  revenue: number;           // Cr
  revenueGrowth: number;     // %
  netIncome: number;         // Cr
  employees: number;
  workers: number;
  foundedYear: number;
  sector?: string;
  sharesOutstanding?: number;
  totalPlants?: number;
  plants: Plant[];
  emissionHistory: EmissionData[];
  intensityProjections?: IntensityProjection[];
  stockHistory?: StockSeries;
}

export interface EmissionAnalysis {
  company: Company;
  predictedEmissions: number;
  targetEmissions: number;
  gap: number; // negative = shortfall, positive = surplus
  gapPercentage: number;
  plImpact: number; // in crores
  estimatedSharePriceImpact: number; // % change
}
