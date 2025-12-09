import { useState } from "react";
import { Forfait } from "@/types/telecom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Database, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForfaitTableProps {
  forfaits: Forfait[];
  onUpdate: (forfaits: Forfait[]) => void;
}

export function ForfaitTable({ forfaits, onUpdate }: ForfaitTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Forfait>>({});

  const handleAdd = () => {
    const newForfait: Forfait = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Forfait ${forfaits.length + 1}`,
      dataGo: 5,
      cost: 5,
      basePrice: 15,
      demandA: 3000,
      demandB: 150,
      isActive: true,
    };
    onUpdate([...forfaits, newForfait]);
  };

  const handleDelete = (id: string) => {
    onUpdate(forfaits.filter((f) => f.id !== id));
  };

  const handleToggle = (id: string) => {
    onUpdate(
      forfaits.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const startEditing = (forfait: Forfait) => {
    setEditingId(forfait.id);
    setEditValues(forfait);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = () => {
    if (editingId && editValues) {
      onUpdate(
        forfaits.map((f) =>
          f.id === editingId ? { ...f, ...editValues } : f
        )
      );
      setEditingId(null);
      setEditValues({});
    }
  };

  const updateEditValue = (field: keyof Forfait, value: string | number) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Forfaits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configurez les caractéristiques de chaque forfait
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} variant="glow" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Actif</TableHead>
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold text-right">
                  Data (Go)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Coût (€)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Prix Base (€)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Demande (a)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Élasticité (b)
                </TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forfaits.map((forfait, index) => (
                <TableRow
                  key={forfait.id}
                  className={cn(
                    "transition-colors",
                    !forfait.isActive && "opacity-50",
                    index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                  )}
                >
                  <TableCell>
                    <Switch
                      checked={forfait.isActive}
                      onCheckedChange={() => handleToggle(forfait.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === forfait.id ? (
                      <Input
                        value={editValues.name || ""}
                        onChange={(e) => updateEditValue("name", e.target.value)}
                        className="h-8 w-32"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{forfait.name}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {forfait.dataGo}Go
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {editingId === forfait.id ? (
                      <Input
                        type="number"
                        value={editValues.dataGo || 0}
                        onChange={(e) =>
                          updateEditValue("dataGo", Number(e.target.value))
                        }
                        className="h-8 w-20 text-right"
                      />
                    ) : (
                      forfait.dataGo
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {editingId === forfait.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.cost || 0}
                        onChange={(e) =>
                          updateEditValue("cost", Number(e.target.value))
                        }
                        className="h-8 w-20 text-right"
                      />
                    ) : (
                      `${forfait.cost.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {editingId === forfait.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues.basePrice || 0}
                        onChange={(e) =>
                          updateEditValue("basePrice", Number(e.target.value))
                        }
                        className="h-8 w-24 text-right"
                      />
                    ) : (
                      `${forfait.basePrice.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {editingId === forfait.id ? (
                      <Input
                        type="number"
                        value={editValues.demandA || 0}
                        onChange={(e) =>
                          updateEditValue("demandA", Number(e.target.value))
                        }
                        className="h-8 w-24 text-right"
                      />
                    ) : (
                      forfait.demandA.toLocaleString()
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {editingId === forfait.id ? (
                      <Input
                        type="number"
                        value={editValues.demandB || 0}
                        onChange={(e) =>
                          updateEditValue("demandB", Number(e.target.value))
                        }
                        className="h-8 w-20 text-right"
                      />
                    ) : (
                      forfait.demandB
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {editingId === forfait.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={saveEditing}
                            className="h-8 w-8 text-success hover:text-success"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEditing}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditing(forfait)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(forfait.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
