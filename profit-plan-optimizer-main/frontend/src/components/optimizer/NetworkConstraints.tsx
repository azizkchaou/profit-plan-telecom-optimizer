import { NetworkConstraints as NetworkConstraintsType } from "@/types/telecom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Wifi, Server, TrendingUp } from "lucide-react";

interface NetworkConstraintsProps {
  constraints: NetworkConstraintsType;
  onUpdate: (constraints: NetworkConstraintsType) => void;
}

export function NetworkConstraints({
  constraints,
  onUpdate,
}: NetworkConstraintsProps) {
  const handleChange = (
    field: keyof NetworkConstraintsType,
    value: number
  ) => {
    onUpdate({ ...constraints, [field]: value });
  };

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-warning/20 p-2">
            <Server className="h-5 w-5 text-warning" />
          </div>
          <div>
            <CardTitle>Contraintes Réseau</CardTitle>
            <p className="text-sm text-muted-foreground">
              Paramètres de capacité et règles métier
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Capacité totale */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="totalCapacity" className="text-sm font-medium">
                Capacité Totale (Go)
              </Label>
            </div>
            <Input
              id="totalCapacity"
              type="number"
              value={constraints.totalCapacity}
              onChange={(e) =>
                handleChange("totalCapacity", Number(e.target.value))
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {(constraints.totalCapacity / 1000000).toFixed(1)}M Go disponibles
            </p>
          </div>

          {/* Capacité en pointe */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="peakCapacity" className="text-sm font-medium">
                Capacité Pointe (Go)
              </Label>
            </div>
            <Input
              id="peakCapacity"
              type="number"
              value={constraints.peakCapacity}
              onChange={(e) =>
                handleChange("peakCapacity", Number(e.target.value))
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {(constraints.peakCapacity / 1000).toFixed(0)}K Go en heures de pointe
            </p>
          </div>

          {/* Marge minimale */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Marge Min. entre Prix (€)
            </Label>
            <div className="pt-2">
              <Slider
                value={[constraints.minMargin]}
                onValueChange={(val) => handleChange("minMargin", val[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1€</span>
              <span className="font-mono font-medium text-foreground">
                {constraints.minMargin}€
              </span>
              <span>20€</span>
            </div>
          </div>
        </div>

        {/* Visualisation de la capacité */}
        <div className="rounded-lg bg-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Utilisation Réseau Estimée</span>
            <span className="font-mono text-sm text-muted-foreground">0%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success via-warning to-destructive rounded-full transition-all duration-500"
              style={{ width: "0%" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0 Go</span>
            <span>{(constraints.totalCapacity / 1000000).toFixed(1)}M Go</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
