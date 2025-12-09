// Types pour le modèle d'optimisation télécom

export interface Forfait {
  id: string;
  name: string;
  dataGo: number;        // Données en Go
  cost: number;          // Coût de production
  basePrice: number;     // Prix de base suggéré
  demandA: number;       // Paramètre a de la demande (ordonnée à l'origine)
  demandB: number;       // Paramètre b de la demande (élasticité)
  isActive: boolean;     // Forfait activé dans l'offre
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  size: number;          // Nombre de clients potentiels
  elasticity: number;    // Multiplicateur d'élasticité
  preferences: {         // Préférences par forfait
    [forfaitId: string]: number; // Score de préférence 0-1
  };
}

export interface NetworkConstraints {
  totalCapacity: number;     // Capacité totale en Go
  peakCapacity: number;      // Capacité en heures de pointe
  minMargin: number;         // Marge minimale entre forfaits
}

export interface OptimizationResult {
  success: boolean;
  status: string;
  optimalPrices: { [forfaitId: string]: number };
  demands: { [forfaitId: string]: number };
  segmentAllocation: { [segmentId: string]: { [forfaitId: string]: number } };
  totalProfit: number;
  profitByForfait: { [forfaitId: string]: number };
  networkUsage: number;
  networkUtilization: number;
  executionTime: number;
  iterations: number;
}

export interface SensitivityResult {
  forfaitId: string;
  forfaitName: string;
  priceVariation: number[];  // -10% à +10%
  profitVariation: number[];
  demandVariation: number[];
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface DemandCurvePoint {
  price: number;
  demand: number;
  forfaitId: string;
  forfaitName: string;
}
