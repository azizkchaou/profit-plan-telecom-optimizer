import { Forfait, Segment, NetworkConstraints } from "@/types/telecom";

// Génération d'IDs simples
const generateId = () => Math.random().toString(36).substring(2, 9);

export const defaultForfaits: Forfait[] = [
  {
    id: generateId(),
    name: "Essentiel 1Go",
    dataGo: 1,
    cost: 3,
    basePrice: 9.99,
    demandA: 5000,
    demandB: 400,
    isActive: true,
  },
  {
    id: generateId(),
    name: "Standard 10Go",
    dataGo: 10,
    cost: 8,
    basePrice: 19.99,
    demandA: 8000,
    demandB: 300,
    isActive: true,
  },
  {
    id: generateId(),
    name: "Premium 50Go",
    dataGo: 50,
    cost: 15,
    basePrice: 34.99,
    demandA: 4000,
    demandB: 100,
    isActive: true,
  },
  {
    id: generateId(),
    name: "Illimité 100Go",
    dataGo: 100,
    cost: 25,
    basePrice: 49.99,
    demandA: 2000,
    demandB: 35,
    isActive: true,
  },
];

export const defaultSegments: Segment[] = [
  {
    id: generateId(),
    name: "Économique",
    description: "Utilisateurs sensibles au prix, usage minimal",
    size: 25000,
    elasticity: 1.5,
    preferences: {},
  },
  {
    id: generateId(),
    name: "Standard",
    description: "Utilisateurs réguliers, usage modéré",
    size: 45000,
    elasticity: 1.0,
    preferences: {},
  },
  {
    id: generateId(),
    name: "Premium",
    description: "Gros consommateurs, moins sensibles au prix",
    size: 15000,
    elasticity: 0.6,
    preferences: {},
  },
];

export const defaultNetworkConstraints: NetworkConstraints = {
  totalCapacity: 5000000,    // 5 millions de Go
  peakCapacity: 100000,      // 100k Go en pointe
  minMargin: 5,              // 5€ minimum entre forfaits
};

// Fonction pour initialiser les préférences des segments
export function initializeSegmentPreferences(
  segments: Segment[],
  forfaits: Forfait[]
): Segment[] {
  return segments.map((segment, segIndex) => {
    const preferences: { [key: string]: number } = {};

    forfaits.forEach((forfait, forfIndex) => {
      // Les segments économiques préfèrent les petits forfaits
      // Les segments premium préfèrent les gros forfaits
      const basePreference = 1 - Math.abs(segIndex - forfIndex) * 0.2;
      preferences[forfait.id] = Math.max(0.2, Math.min(1, basePreference));
    });

    return { ...segment, preferences };
  });
}
