import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/optimizer/Header";
import { ForfaitTable } from "@/components/optimizer/ForfaitTable";
import { SegmentTable } from "@/components/optimizer/SegmentTable";
import { NetworkConstraints } from "@/components/optimizer/NetworkConstraints";
import { ResultsDisplay } from "@/components/optimizer/ResultsDisplay";
import { Charts } from "@/components/optimizer/Charts";
import {
  defaultForfaits,
  defaultSegments,
  defaultNetworkConstraints,
  initializeSegmentPreferences,
} from "@/data/defaultData";
import { TelecomOptimizer, exportToCSV } from "@/lib/optimizer";
import { api } from "@/lib/api";
import {
  Forfait,
  Segment,
  NetworkConstraints as NetworkConstraintsType,
  OptimizationResult,
  SensitivityResult,
} from "@/types/telecom";
import { toast } from "@/hooks/use-toast";
import { Database, Users, Settings, BarChart3, TrendingUp } from "lucide-react";

export default function Index() {
  // État des données
  const [forfaits, setForfaits] = useState<Forfait[]>(defaultForfaits);
  const [segments, setSegments] = useState<Segment[]>(() =>
    initializeSegmentPreferences(defaultSegments, defaultForfaits)
  );
  const [constraints, setConstraints] = useState<NetworkConstraintsType>(
    defaultNetworkConstraints
  );

  // État de l'optimisation
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [sensitivityResults, setSensitivityResults] = useState<SensitivityResult[]>([]);
  const [activeTab, setActiveTab] = useState("data");

  // Mise à jour des segments avec préférences
  const handleForfaitsUpdate = useCallback(
    (newForfaits: Forfait[]) => {
      setForfaits(newForfaits);
      setSegments((prev) => initializeSegmentPreferences(prev, newForfaits));
    },
    []
  );

  // Lancer l'optimisation
  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true);

    // Simulation d'un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // server-side optimization
      const optimizationResult = await api.optimizePlans(forfaits, segments, constraints);

      // Local sensitivity analysis (using the result from server)
      const optimizer = new TelecomOptimizer(forfaits, segments, constraints);

      setResult(optimizationResult);

      // Analyse de sensibilité
      const sensitivity = optimizer.sensitivityAnalysis(optimizationResult);
      setSensitivityResults(sensitivity);

      // Passer à l'onglet résultats
      setActiveTab("results");

      toast({
        title: "Optimisation terminée",
        description: `Profit optimal: ${optimizationResult.totalProfit.toLocaleString(
          "fr-FR",
          { maximumFractionDigits: 2 }
        )} € en ${optimizationResult.executionTime.toFixed(0)}ms`,
      });
    } catch (error) {
      console.error("Erreur d'optimisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'optimisation.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [forfaits, segments, constraints]);

  // Réinitialiser
  const handleReset = useCallback(() => {
    setForfaits(defaultForfaits);
    setSegments(initializeSegmentPreferences(defaultSegments, defaultForfaits));
    setConstraints(defaultNetworkConstraints);
    setResult(null);
    setSensitivityResults([]);
    setActiveTab("data");

    toast({
      title: "Données réinitialisées",
      description: "Les valeurs par défaut ont été restaurées.",
    });
  }, []);

  // Exporter en CSV
  const handleExport = useCallback(() => {
    if (!result) return;

    const csv = exportToCSV(result, forfaits);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `optimisation_telecom_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé.",
    });
  }, [result, forfaits]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Header
        isOptimizing={isOptimizing}
        hasResults={!!result}
        onOptimize={handleOptimize}
        onReset={handleReset}
        onExport={handleExport}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-secondary/50 p-1">
            <TabsTrigger
              value="data"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Données</span>
            </TabsTrigger>
            <TabsTrigger
              value="segments"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Segments</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Résultats</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Graphiques</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6 animate-fade-in">
            <ForfaitTable forfaits={forfaits} onUpdate={handleForfaitsUpdate} />
            <NetworkConstraints
              constraints={constraints}
              onUpdate={setConstraints}
            />
          </TabsContent>

          <TabsContent value="segments" className="animate-fade-in">
            <SegmentTable segments={segments} onUpdate={setSegments} />
          </TabsContent>

          <TabsContent value="results" className="animate-fade-in">
            <ResultsDisplay result={result} forfaits={forfaits} />
          </TabsContent>

          <TabsContent value="charts" className="animate-fade-in">
            <Charts
              result={result}
              forfaits={forfaits}
              sensitivityResults={sensitivityResults}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Modèle d'optimisation PL/PLNE pour tarification télécom
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">v1.0</span>
              <span>•</span>
              <span>Simulation JavaScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
