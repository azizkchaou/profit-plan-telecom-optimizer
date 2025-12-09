import { OptimizationResult, Forfait } from "@/types/telecom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "./StatCard";
import {
  TrendingUp,
  DollarSign,
  Users,
  Wifi,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  result: OptimizationResult | null;
  forfaits: Forfait[];
}

export function ResultsDisplay({ result, forfaits }: ResultsDisplayProps) {
  if (!result) {
    return (
      <Card variant="glass" className="animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Lancez l'optimisation pour voir les prix optimaux et les métriques de performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeForfaits = forfaits.filter((f) => f.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs principaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Profit Total"
          value={`${result.totalProfit.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Demande Totale"
          value={Object.values(result.demands)
            .reduce((a, b) => a + b, 0)
            .toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
          subtitle="clients"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Utilisation Réseau"
          value={`${result.networkUtilization.toFixed(1)}%`}
          icon={Wifi}
          variant={result.networkUtilization > 80 ? "warning" : "default"}
        />
        <StatCard
          title="Temps d'Exécution"
          value={`${result.executionTime.toFixed(0)} ms`}
          subtitle={`${result.iterations} itérations`}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Statut */}
      <Card variant="glow" className="border-success/30">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="font-medium text-success">{result.status}</span>
        </CardContent>
      </Card>

      {/* Tableau des résultats */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Prix Optimaux par Forfait</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Forfait</TableHead>
                  <TableHead className="font-semibold text-right">
                    Prix Base
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Prix Optimal
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Variation
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Demande
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Profit
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Marge
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeForfaits.map((forfait, index) => {
                  const optimalPrice = result.optimalPrices[forfait.id];
                  const demand = result.demands[forfait.id];
                  const profit = result.profitByForfait[forfait.id];
                  const variation =
                    ((optimalPrice - forfait.basePrice) / forfait.basePrice) *
                    100;
                  const margin =
                    ((optimalPrice - forfait.cost) / optimalPrice) * 100;

                  return (
                    <TableRow
                      key={forfait.id}
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{forfait.name}</span>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {forfait.dataGo}Go
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {forfait.basePrice.toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-bold text-primary">
                          {optimalPrice.toFixed(2)} €
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={cn(
                            "font-mono",
                            variation > 0
                              ? "bg-success/20 text-success"
                              : variation < 0
                              ? "bg-destructive/20 text-destructive"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {variation > 0 ? "+" : ""}
                          {variation.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {demand.toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {profit.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        €
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                              style={{ width: `${Math.min(margin, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm text-muted-foreground w-12">
                            {margin.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
