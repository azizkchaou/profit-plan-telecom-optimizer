import {
  Forfait,
  Segment,
  NetworkConstraints,
  OptimizationResult,
  SensitivityResult,
} from "@/types/telecom";

/**
 * Classe d'optimisation des prix de forfaits télécoms
 * Implémentation JavaScript simulant un solveur PL/PLNE
 * 
 * Modèle mathématique:
 * - Variables: p_f (prix forfait), q_f (demande), x_f_s (allocation segment-forfait)
 * - Objectif: Max Σ (p_f - c_f) * q_f
 * - Contraintes: prix ordonnés, capacité réseau, demande = a - b*p
 */
export class TelecomOptimizer {
  private forfaits: Forfait[];
  private segments: Segment[];
  private constraints: NetworkConstraints;
  private maxIterations: number = 1000;
  private tolerance: number = 0.001;
  private learningRate: number = 0.5;

  constructor(
    forfaits: Forfait[],
    segments: Segment[],
    constraints: NetworkConstraints
  ) {
    this.forfaits = forfaits.filter(f => f.isActive);
    this.segments = segments;
    this.constraints = constraints;
  }

  /**
   * Calcule la demande pour un forfait à un prix donné
   * q = a - b * p (fonction de demande linéaire)
   */
  private calculateDemand(forfait: Forfait, price: number): number {
    const demand = forfait.demandA - forfait.demandB * price;
    return Math.max(0, demand);
  }

  /**
   * Calcule la demande segmentée
   */
  private calculateSegmentedDemand(
    forfait: Forfait,
    price: number,
    segment: Segment
  ): number {
    const baseDemand = this.calculateDemand(forfait, price);
    const preference = segment.preferences[forfait.id] || 0.5;
    const elasticityFactor = segment.elasticity;
    
    // Demande ajustée = demande base * préférence * (taille segment / total) * élasticité
    const totalSize = this.segments.reduce((sum, s) => sum + s.size, 0);
    const segmentShare = segment.size / totalSize;
    
    return baseDemand * preference * segmentShare * (1 / elasticityFactor);
  }

  /**
   * Calcule le profit pour un ensemble de prix
   */
  private calculateProfit(prices: { [id: string]: number }): number {
    let totalProfit = 0;

    this.forfaits.forEach(forfait => {
      const price = prices[forfait.id];
      let totalDemand = 0;

      this.segments.forEach(segment => {
        totalDemand += this.calculateSegmentedDemand(forfait, price, segment);
      });

      const profit = (price - forfait.cost) * totalDemand;
      totalProfit += profit;
    });

    return totalProfit;
  }

  /**
   * Vérifie les contraintes de capacité réseau
   */
  private checkNetworkConstraint(prices: { [id: string]: number }): boolean {
    let totalUsage = 0;

    this.forfaits.forEach(forfait => {
      const price = prices[forfait.id];
      let totalDemand = 0;

      this.segments.forEach(segment => {
        totalDemand += this.calculateSegmentedDemand(forfait, price, segment);
      });

      totalUsage += totalDemand * forfait.dataGo;
    });

    return totalUsage <= this.constraints.totalCapacity;
  }

  /**
   * Vérifie les contraintes de prix ordonnés
   */
  private checkPriceOrderConstraint(prices: { [id: string]: number }): boolean {
    const sortedForfaits = [...this.forfaits].sort((a, b) => a.dataGo - b.dataGo);
    
    for (let i = 1; i < sortedForfaits.length; i++) {
      const prevPrice = prices[sortedForfaits[i - 1].id];
      const currPrice = prices[sortedForfaits[i].id];
      
      if (currPrice < prevPrice + this.constraints.minMargin) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Applique les contraintes de prix ordonnés
   */
  private enforcePriceOrder(prices: { [id: string]: number }): { [id: string]: number } {
    const result = { ...prices };
    const sortedForfaits = [...this.forfaits].sort((a, b) => a.dataGo - b.dataGo);
    
    for (let i = 1; i < sortedForfaits.length; i++) {
      const prevPrice = result[sortedForfaits[i - 1].id];
      const currPrice = result[sortedForfaits[i].id];
      
      if (currPrice < prevPrice + this.constraints.minMargin) {
        result[sortedForfaits[i].id] = prevPrice + this.constraints.minMargin;
      }
    }
    
    return result;
  }

  /**
   * Algorithme d'optimisation par descente de gradient avec contraintes
   */
  public optimize(): OptimizationResult {
    const startTime = performance.now();
    
    // Initialisation avec les prix de base
    let prices: { [id: string]: number } = {};
    this.forfaits.forEach(forfait => {
      prices[forfait.id] = forfait.basePrice;
    });
    prices = this.enforcePriceOrder(prices);

    let bestPrices = { ...prices };
    let bestProfit = this.calculateProfit(prices);
    let iteration = 0;

    // Optimisation itérative
    while (iteration < this.maxIterations) {
      let improved = false;

      // Pour chaque forfait, chercher le meilleur prix
      for (const forfait of this.forfaits) {
        const currentPrice = prices[forfait.id];
        
        // Tester des variations de prix
        for (const delta of [-2, -1, -0.5, 0.5, 1, 2]) {
          const newPrice = Math.max(forfait.cost + 1, currentPrice + delta);
          const testPrices = { ...prices, [forfait.id]: newPrice };
          const orderedPrices = this.enforcePriceOrder(testPrices);
          
          if (this.checkNetworkConstraint(orderedPrices)) {
            const profit = this.calculateProfit(orderedPrices);
            
            if (profit > bestProfit + this.tolerance) {
              bestProfit = profit;
              bestPrices = orderedPrices;
              improved = true;
            }
          }
        }
      }

      prices = { ...bestPrices };
      iteration++;

      if (!improved) {
        break;
      }
    }

    // Calcul des résultats finaux
    const demands: { [id: string]: number } = {};
    const profitByForfait: { [id: string]: number } = {};
    const segmentAllocation: { [segId: string]: { [forfId: string]: number } } = {};
    let networkUsage = 0;

    this.forfaits.forEach(forfait => {
      let totalDemand = 0;

      this.segments.forEach(segment => {
        const segDemand = this.calculateSegmentedDemand(forfait, bestPrices[forfait.id], segment);
        totalDemand += segDemand;

        if (!segmentAllocation[segment.id]) {
          segmentAllocation[segment.id] = {};
        }
        segmentAllocation[segment.id][forfait.id] = segDemand;
      });

      demands[forfait.id] = totalDemand;
      profitByForfait[forfait.id] = (bestPrices[forfait.id] - forfait.cost) * totalDemand;
      networkUsage += totalDemand * forfait.dataGo;
    });

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      status: `Optimisation terminée en ${iteration} itérations`,
      optimalPrices: bestPrices,
      demands,
      segmentAllocation,
      totalProfit: bestProfit,
      profitByForfait,
      networkUsage,
      networkUtilization: (networkUsage / this.constraints.totalCapacity) * 100,
      executionTime,
      iterations: iteration,
    };
  }

  /**
   * Analyse de sensibilité: variation du profit en fonction des prix
   */
  public sensitivityAnalysis(
    result: OptimizationResult,
    variationRange: number = 0.1
  ): SensitivityResult[] {
    const results: SensitivityResult[] = [];

    this.forfaits.forEach(forfait => {
      const basePrice = result.optimalPrices[forfait.id];
      const priceVariations: number[] = [];
      const profitVariations: number[] = [];
      const demandVariations: number[] = [];

      // Tester de -10% à +10%
      for (let i = -10; i <= 10; i += 2) {
        const variation = i / 100;
        const testPrice = basePrice * (1 + variation);
        const testPrices = { 
          ...result.optimalPrices, 
          [forfait.id]: testPrice 
        };

        const profit = this.calculateProfit(testPrices);
        let demand = 0;
        this.segments.forEach(segment => {
          demand += this.calculateSegmentedDemand(forfait, testPrice, segment);
        });

        priceVariations.push(i);
        profitVariations.push(profit);
        demandVariations.push(demand);
      }

      results.push({
        forfaitId: forfait.id,
        forfaitName: forfait.name,
        priceVariation: priceVariations,
        profitVariation: profitVariations,
        demandVariation: demandVariations,
      });
    });

    return results;
  }

  /**
   * Génère les données pour les courbes de demande
   */
  public generateDemandCurves(
    minPrice: number = 0,
    maxPrice: number = 80,
    step: number = 1
  ): { price: number; [key: string]: number }[] {
    const data: { price: number; [key: string]: number }[] = [];

    for (let price = minPrice; price <= maxPrice; price += step) {
      const point: { price: number; [key: string]: number } = { price };

      this.forfaits.forEach(forfait => {
        point[forfait.name] = this.calculateDemand(forfait, price);
      });

      data.push(point);
    }

    return data;
  }
}

/**
 * Exporte les résultats en CSV
 */
export function exportToCSV(result: OptimizationResult, forfaits: Forfait[]): string {
  const lines: string[] = [];
  
  // En-tête
  lines.push("Forfait,Prix Optimal (€),Demande,Profit (€),Marge (%)");
  
  // Données
  forfaits.filter(f => f.isActive).forEach(forfait => {
    const price = result.optimalPrices[forfait.id]?.toFixed(2) || "N/A";
    const demand = result.demands[forfait.id]?.toFixed(0) || "0";
    const profit = result.profitByForfait[forfait.id]?.toFixed(2) || "0";
    const margin = ((result.optimalPrices[forfait.id] - forfait.cost) / result.optimalPrices[forfait.id] * 100).toFixed(1);
    
    lines.push(`${forfait.name},${price},${demand},${profit},${margin}%`);
  });
  
  // Résumé
  lines.push("");
  lines.push(`Profit Total,${result.totalProfit.toFixed(2)} €`);
  lines.push(`Utilisation Réseau,${result.networkUtilization.toFixed(1)}%`);
  lines.push(`Temps d'exécution,${result.executionTime.toFixed(0)} ms`);
  
  return lines.join("\n");
}
