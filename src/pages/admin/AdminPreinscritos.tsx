import { useState } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminLeads } from "@/hooks/useAdminLeads";
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
  const [confirmConvert, setConfirmConvert] = useState<string | null>(null);

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

  const handleConvertLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.advisor_id || !user) return;

    setConverting(leadId);

    // Create expediente without user_id (lead has no account yet)
    const tramiteCode = lead.necesidad?.split(", ")[0] ?? "general";
    const { data: expData, error: expError } = await supabase
      .from('expedientes')
      .insert({
        user_id: null,
        tramite_code: tramiteCode,
        status: 'no_iniciado' as const,
        advisor_id: lead.advisor_id,
        origin_country: lead.pais_origen ?? null,
      })
      .select('id, tramite_code')
      .maybeSingle();

    if (expError) {
      toast({ title: "Error al crear expediente", description: expError.message, variant: "destructive" });
      setConverting(null);
      return;
    }

    // Mark lead as converted
    await updateLead(leadId, { status: 'converted' });

    // Notify assigned gestor
    await notifyGestorAssignment({
      advisorId: lead.advisor_id,
      tramiteName: tramiteCode,
      userName: lead.nombre,
      expedienteId: expData?.id ?? null,
      createdBy: user.id,
    });

    toast({ title: "Lead convertido", description: `Se creó un expediente para ${lead.nombre} y se notificó al gestor.` });
    setConverting(null);
    setConfirmConvert(null);
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
                          onClick={() => setConfirmConvert(lead.id)}
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

      {/* Confirm conversion dialog */}
      <AlertDialog open={!!confirmConvert} onOpenChange={() => setConfirmConvert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Convertir lead en expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará un nuevo expediente asignado al gestor seleccionado. El lead quedará marcado como convertido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmConvert && handleConvertLead(confirmConvert)}>
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPreinscritos;
