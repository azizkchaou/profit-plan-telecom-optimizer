import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Download,
  RotateCcw,
  Zap,
  Signal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isOptimizing: boolean;
  hasResults: boolean;
  onOptimize: () => void;
  onReset: () => void;
  onExport: () => void;
}

export function Header({
  isOptimizing,
  hasResults,
  onOptimize,
  onReset,
  onExport,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-accent opacity-50 blur" />
              <div className="relative rounded-xl bg-card p-2.5">
                <Signal className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Telecom Pricing Optimizer
              </h1>
              <p className="text-sm text-muted-foreground">
                Optimisation des prix de forfaits mobiles
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1">
              <Zap className="h-3 w-3" />
              PL / PLNE
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isOptimizing}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>

            {hasResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}

            <Button
              variant="glow"
              size="sm"
              onClick={onOptimize}
              disabled={isOptimizing}
              className={cn(
                "min-w-[140px]",
                isOptimizing && "animate-pulse"
              )}
            >
              {isOptimizing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Optimiser
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
