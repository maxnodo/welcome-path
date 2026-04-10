import { useState, useEffect } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAdminLeads, Lead } from "@/hooks/useAdminLeads";
import { useGestores } from "@/hooks/useGestores";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { notifyGestorAssignment } from "@/lib/notifyGestorAssignment";

const AdminPreinscritos = () => {
  const { user, isAdmin } = useAuth();
  const { leads, loading, updateLead } = useAdminLeads();
  const { gestores } = useGestores();
  const { toast } = useToast();
  const [converting, setConverting] = useState<string | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertTramite, setConvertTramite] = useState("");
  const [tramites, setTramites] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('tramites_catalog').select('code, name').eq('is_active', true).then(({ data }) => {
      setTramites(data ?? []);
    });
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleAssignGestor = async (leadId: string, advisorId: string) => {
    const { error } = await updateLead(leadId, { advisor_id: advisorId });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openConvertDialog = (lead: Lead) => {
    setConvertLead(lead);
    setConvertTramite("");
  };

  const handleConvertLead = async () => {
    if (!convertLead || !convertLead.advisor_id || !user || !convertTramite) return;

    setConverting(convertLead.id);

    const { data: expData, error: expError } = await supabase
      .from('expedientes')
      .insert({
        user_id: null,
        tramite_code: convertTramite,
        status: 'no_iniciado' as const,
        advisor_id: convertLead.advisor_id,
        origin_country: convertLead.pais_origen ?? null,
      })
      .select('id, tramite_code')
      .maybeSingle();

    if (expError) {
      toast({ title: "Error al crear expediente", description: expError.message, variant: "destructive" });
      setConverting(null);
      return;
    }

    await updateLead(convertLead.id, { status: 'converted' });

    const tramiteName = tramites.find(t => t.code === convertTramite)?.name ?? convertTramite;
    await notifyGestorAssignment({
      advisorId: convertLead.advisor_id,
      tramiteName,
      userName: convertLead.nombre,
      expedienteId: expData?.id ?? null,
      createdBy: user.id,
    });

    toast({ title: "Lead convertido", description: `Se creó un expediente para ${convertLead.nombre} y se notificó al gestor.` });
    setConverting(null);
    setConvertLead(null);
  };

  const getGestorName = (id: string | null) => {
    if (!id) return null;
    const g = gestores.find(g => g.id === id);
    return g?.full_name ?? g?.email ?? null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Pre-inscritos</h2>
          <Badge variant="secondary">{leads.length} registros</Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay pre-inscritos aún.
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Necesidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const isConverted = lead.status === "converted";
                return (
                  <TableRow key={lead.id} className={isConverted ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{lead.nombre}</TableCell>
                    <TableCell>{lead.email ?? "—"}</TableCell>
                    <TableCell>{lead.telefono}</TableCell>
                    <TableCell>{lead.pais_origen ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {lead.necesidad ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.necesidad.split(", ").map((n) => (
                            <span key={n} className="text-xs bg-muted px-2 py-0.5 rounded-full">{n}</span>
                          ))}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      {isConverted ? (
                        <span className="text-xs text-muted-foreground">{getGestorName(lead.advisor_id) ?? "—"}</span>
                      ) : isAdmin ? (
                        <Select
                          value={lead.advisor_id ?? ""}
                          onValueChange={(v) => handleAssignGestor(lead.id, v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[140px]">
                            <SelectValue placeholder="Asignar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {gestores.map(g => (
                              <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">{getGestorName(lead.advisor_id) ?? "Sin asignar"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isConverted ? (
                        <Badge variant="outline" className="text-xs gap-1 border-success/30 text-success">
                          <Check size={10} /> Convertido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isConverted && isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          disabled={!lead.advisor_id || converting === lead.id}
                          onClick={() => openConvertDialog(lead)}
                        >
                          <ArrowRightLeft size={12} />
                          {converting === lead.id ? "Convirtiendo..." : "Convertir"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Convert lead dialog with tramite selector */}
      <Dialog open={!!convertLead} onOpenChange={() => setConvertLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convertir lead en expediente</DialogTitle>
          </DialogHeader>
          {convertLead && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-foreground">{convertLead.nombre}</p>
                <p className="text-muted-foreground">{convertLead.email ?? convertLead.telefono}</p>
                {convertLead.necesidad && (
                  <div className="pt-1">
                    <span className="text-xs text-muted-foreground">Necesidad indicada: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {convertLead.necesidad.split(", ").map((n) => (
                        <span key={n} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Trámite a crear <span className="text-destructive">*</span></Label>
                <Select value={convertTramite} onValueChange={setConvertTramite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar trámite del catálogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tramites.map(t => (
                      <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Gestor asignado: <span className="text-foreground font-medium">{getGestorName(convertLead.advisor_id)}</span></p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertLead(null)}>Cancelar</Button>
            <Button
              onClick={handleConvertLead}
              disabled={!convertTramite || converting === convertLead?.id}
            >
              {converting === convertLead?.id ? "Convirtiendo..." : "Crear expediente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPreinscritos;
