import { useState } from "react";
import { Segment } from "@/types/telecom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Users, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentTableProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
}

export function SegmentTable({ segments, onUpdate }: SegmentTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Segment>>({});

  const handleAdd = () => {
    const newSegment: Segment = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Segment ${segments.length + 1}`,
      description: "Nouveau segment client",
      size: 10000,
      elasticity: 1.0,
      preferences: {},
    };
    onUpdate([...segments, newSegment]);
  };

  const handleDelete = (id: string) => {
    onUpdate(segments.filter((s) => s.id !== id));
  };

  const startEditing = (segment: Segment) => {
    setEditingId(segment.id);
    setEditValues(segment);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = () => {
    if (editingId && editValues) {
      onUpdate(
        segments.map((s) =>
          s.id === editingId ? { ...s, ...editValues } : s
        )
      );
      setEditingId(null);
      setEditValues({});
    }
  };

  const updateEditValue = (field: keyof Segment, value: string | number) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const getElasticityColor = (elasticity: number) => {
    if (elasticity < 0.7) return "text-success";
    if (elasticity > 1.3) return "text-destructive";
    return "text-warning";
  };

  const getElasticityLabel = (elasticity: number) => {
    if (elasticity < 0.7) return "Faible";
    if (elasticity > 1.3) return "Élevée";
    return "Moyenne";
  };

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/20 p-2">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>Segments Clients</CardTitle>
            <p className="text-sm text-muted-foreground">
              Définissez les caractéristiques de chaque segment
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
                <TableHead className="font-semibold">Nom</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold text-right">
                  Taille
                </TableHead>
                <TableHead className="font-semibold text-center">
                  Élasticité Prix
                </TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment, index) => (
                <TableRow
                  key={segment.id}
                  className={cn(
                    "transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                  )}
                >
                  <TableCell>
                    {editingId === segment.id ? (
                      <Input
                        value={editValues.name || ""}
                        onChange={(e) => updateEditValue("name", e.target.value)}
                        className="h-8 w-32"
                      />
                    ) : (
                      <span className="font-medium">{segment.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {editingId === segment.id ? (
                      <Input
                        value={editValues.description || ""}
                        onChange={(e) =>
                          updateEditValue("description", e.target.value)
                        }
                        className="h-8 w-48"
                      />
                    ) : (
                      segment.description
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {editingId === segment.id ? (
                      <Input
                        type="number"
                        value={editValues.size || 0}
                        onChange={(e) =>
                          updateEditValue("size", Number(e.target.value))
                        }
                        className="h-8 w-28 text-right"
                      />
                    ) : (
                      segment.size.toLocaleString()
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === segment.id ? (
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[editValues.elasticity || 1]}
                          onValueChange={(val) =>
                            updateEditValue("elasticity", val[0])
                          }
                          min={0.3}
                          max={2}
                          step={0.1}
                          className="w-24"
                        />
                        <span className="font-mono text-sm w-10">
                          {(editValues.elasticity || 1).toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              segment.elasticity < 0.7
                                ? "bg-success"
                                : segment.elasticity > 1.3
                                ? "bg-destructive"
                                : "bg-warning"
                            )}
                            style={{ width: `${(segment.elasticity / 2) * 100}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-mono text-sm",
                            getElasticityColor(segment.elasticity)
                          )}
                        >
                          {segment.elasticity.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({getElasticityLabel(segment.elasticity)})
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {editingId === segment.id ? (
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
                            onClick={() => startEditing(segment)}
                            className="h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(segment.id)}
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
