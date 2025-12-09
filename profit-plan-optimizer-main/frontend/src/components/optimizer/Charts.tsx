import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { OptimizationResult, Forfait, SensitivityResult } from "@/types/telecom";
import { TelecomOptimizer } from "@/lib/optimizer";
import { TrendingUp, PieChart as PieChartIcon, Activity, BarChart3 } from "lucide-react";

interface ChartsProps {
  result: OptimizationResult | null;
  forfaits: Forfait[];
  sensitivityResults: SensitivityResult[];
}

const COLORS = [
  "hsl(199, 89%, 48%)", // primary
  "hsl(262, 83%, 58%)", // accent
  "hsl(142, 76%, 36%)", // success
  "hsl(38, 92%, 50%)",  // warning
  "hsl(0, 72%, 51%)",   // destructive
];

export function Charts({ result, forfaits, sensitivityResults }: ChartsProps) {
  const activeForfaits = forfaits.filter((f) => f.isActive);

  // Données pour les courbes de demande
  const demandData = useMemo(() => {
    const data: { price: number; [key: string]: number }[] = [];
    
    for (let price = 5; price <= 80; price += 2) {
      const point: { price: number; [key: string]: number } = { price };
      
      activeForfaits.forEach((forfait) => {
        const demand = Math.max(0, forfait.demandA - forfait.demandB * price);
        point[forfait.name] = demand;
      });
      
      data.push(point);
    }
    
    return data;
  }, [activeForfaits]);

  // Données pour l'histogramme des prix
  const priceData = useMemo(() => {
    if (!result) return [];
    
    return activeForfaits.map((forfait) => ({
      name: forfait.name,
      "Prix Base": forfait.basePrice,
      "Prix Optimal": result.optimalPrices[forfait.id],
      "Coût": forfait.cost,
    }));
  }, [result, activeForfaits]);

  // Données pour le pie chart des profits
  const profitPieData = useMemo(() => {
    if (!result) return [];
    
    return activeForfaits.map((forfait) => ({
      name: forfait.name,
      value: result.profitByForfait[forfait.id],
    }));
  }, [result, activeForfaits]);

  // Données d'utilisation réseau
  const networkData = useMemo(() => {
    if (!result) return [];
    
    return activeForfaits.map((forfait) => ({
      name: forfait.name,
      usage: result.demands[forfait.id] * forfait.dataGo,
      demand: result.demands[forfait.id],
    }));
  }, [result, activeForfaits]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" 
                ? entry.value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                : entry.value}
              {entry.name.includes("Prix") || entry.name === "Coût" ? " €" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!result) {
    return (
      <Card variant="glass" className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Graphiques</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Les visualisations apparaîtront après l'optimisation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
      {/* Courbes de demande */}
      <Card variant="glass" className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Courbes de Demande</CardTitle>
              <p className="text-sm text-muted-foreground">
                Demande en fonction du prix (q = a - b×p)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandData}>
                <defs>
                  {activeForfaits.map((_, i) => (
                    <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="price"
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${v}€`}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {activeForfaits.map((forfait, i) => (
                  <Area
                    key={forfait.id}
                    type="monotone"
                    dataKey={forfait.name}
                    stroke={COLORS[i % COLORS.length]}
                    fill={`url(#gradient-${i})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Histogramme des prix */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-2">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Comparaison des Prix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Base vs Optimal vs Coût
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Coût" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Prix Base" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Prix Optimal" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribution des profits */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/20 p-2">
              <PieChartIcon className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>Distribution des Profits</CardTitle>
              <p className="text-sm text-muted-foreground">Par forfait</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profitPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {profitPieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `${value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Utilisation réseau */}
      <Card variant="glass" className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/20 p-2">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle>Utilisation Réseau</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consommation de données par forfait
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="usage" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Usage (Go)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
