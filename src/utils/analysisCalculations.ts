import { Company, EmissionAnalysis } from "@/types/company";

// Calculate year-over-year reduction rate for intensity
export const calculateIntensityReductionRate = (company: Company): number => {
  const history = company.emissionHistory.filter(h => h.intensityPerTonne);
  if (history.length < 2) return 0;
  
  let totalReduction = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].intensityPerTonne!;
    const curr = history[i].intensityPerTonne!;
    const reduction = (prev - curr) / prev;
    totalReduction += reduction;
  }
  
  return totalReduction / (history.length - 1);
};

// Predict intensity for next year based on average reduction rate
export const predictIntensity = (company: Company): number => {
  const history = company.emissionHistory.filter(h => h.intensityPerTonne);
  if (history.length === 0) return 0;
  
  const latestIntensity = history[history.length - 1].intensityPerTonne!;
  const reductionRate = calculateIntensityReductionRate(company);
  
  return latestIntensity * (1 - reductionRate);
};

// Predict intensity for a specific year ahead
export const predictIntensityForYear = (company: Company, yearsAhead: number): number => {
  const history = company.emissionHistory.filter(h => h.intensityPerTonne);
  if (history.length === 0) return 0;
  
  const latestIntensity = history[history.length - 1].intensityPerTonne!;
  const reductionRate = calculateIntensityReductionRate(company);
  
  return latestIntensity * Math.pow(1 - reductionRate, yearsAhead);
};

// Linear regression to predict next year's emissions
export const predictEmissions = (company: Company): number => {
  const history = company.emissionHistory;
  const n = history.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  history.forEach((data, index) => {
    sumX += index;
    sumY += data.emissions;
    sumXY += index * data.emissions;
    sumX2 += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return slope * n + intercept;
};

// Calculate weighted average of government targets based on plant capacity
export const calculateWeightedTarget = (company: Company): number => {
  const totalCapacity = company.plants.reduce((sum, plant) => sum + plant.capacity, 0);
  const weightedSum = company.plants.reduce(
    (sum, plant) => sum + (plant.governmentTarget * plant.capacity),
    0
  );
  return weightedSum / totalCapacity;
};

// Calculate target emissions based on weighted reduction %
export const calculateTargetEmissions = (company: Company): number => {
  const latestEmissions = company.emissionHistory[company.emissionHistory.length - 1].emissions;
  const targetReduction = calculateWeightedTarget(company);
  return latestEmissions * (1 - targetReduction / 100);
};

// Calculate P&L impact based on carbon pricing
export const calculatePLImpact = (emissionGap: number, carbonPrice: number): number => {
  // emissionGap in million tonnes, carbonPrice in $/tonne
  // Convert to crores (1 million tonnes * $/tonne * 83 INR/USD / 10000000)
  return (emissionGap * carbonPrice * 83) / 10000000;
};

// Estimate share price impact (simplified model)
export const estimateSharePriceImpact = (plImpact: number, marketCap: number): number => {
  // Simple model: % change in market cap based on P&L impact
  // Assuming PE multiple of 25 for cement sector
  const earningsImpact = plImpact;
  const marketCapImpact = earningsImpact * 40;
  return (marketCapImpact / marketCap) * 100;
};

export const analyzeCompany = (company: Company, carbonPrice: number): EmissionAnalysis => {
  
  const gap = (company.intensityProjections[0].govtTarget - company.intensityProjections[0].projected) * company.emissionHistory[2].physicalOutput / 1000 ;
  const predictedEmissions = company.intensityProjections[0].projected * company.emissionHistory[2].physicalOutput / 1000 ;
  const targetEmissions = company.intensityProjections[0].govtTarget * company.emissionHistory[2].physicalOutput / 1000 ;
  const gapPercentage = (gap / targetEmissions) * 100;
  const plImpact = calculatePLImpact(Math.abs(gap), carbonPrice);
  const estimatedSharePriceImpact = estimateSharePriceImpact(
    gap > 0 ? plImpact : -plImpact,
    company.marketCap
  );
  
  return {
    company,
    predictedEmissions,
    targetEmissions,
    gap,
    gapPercentage,
    plImpact: gap > 0 ? plImpact : -plImpact,
    estimatedSharePriceImpact,
  };
};
