import { useState } from "react";
import { Search, Filter, Eye, Download, Trash2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useDocumentos } from "@/hooks/useDocumentos";
import { useGestores } from "@/hooks/useGestores";
import { useAuth } from "@/context/AuthContext";
import { Expediente, ExpedienteStatus, Documento } from "@/types/database.types";
import { notifyGestorAssignment } from "@/lib/notifyGestorAssignment";

const allStatuses: ExpedienteStatus[] = [
  "no_iniciado", "documentacion_incompleta", "en_revision", "requerimiento_adicional",
  "presentado", "aprobado", "finalizado", "denegado", "archivado",
];

const statusLabels: Record<ExpedienteStatus, string> = {
  no_iniciado: "No iniciado",
  documentacion_incompleta: "Doc. incompleta",
  en_revision: "En revisión",
  requerimiento_adicional: "Requerimiento",
  presentado: "Presentado",
  aprobado: "Aprobado",
  finalizado: "Finalizado",
  denegado: "Denegado",
  archivado: "Archivado",
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    en_revision: "bg-secondary/10 text-secondary",
    documentacion_incompleta: "bg-warning/10 text-warning",
    presentado: "bg-purple-500/10 text-purple-600",
    aprobado: "bg-success/10 text-success",
    finalizado: "bg-success/10 text-success",
    no_iniciado: "bg-muted text-muted-foreground",
    requerimiento_adicional: "bg-orange-500/10 text-orange-600",
    denegado: "bg-destructive/10 text-destructive",
    archivado: "bg-muted text-muted-foreground",
  };
  return map[s] ?? "bg-muted text-muted-foreground";
};

const AdminExpedientes = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { expedientes, loading, updateExpediente, deleteExpediente, refetch } = useExpedientes();
  const { updateDocumentStatus, getDocumentUrl } = useDocumentos();
  const { gestores } = useGestores();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGestor, setFilterGestor] = useState<string>("all");
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [detailStatus, setDetailStatus] = useState<ExpedienteStatus>("no_iniciado");
  const [detailAdvisorId, setDetailAdvisorId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filtered = expedientes.filter((e) => {
    const matchSearch =
      !search ||
      (e.tramites_catalog?.name ?? e.tramite_code).toLowerCase().includes(search.toLowerCase()) ||
      (e.expediente_number ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const matchGestor = filterGestor === "all" || (filterGestor === "none" ? !e.advisor_id : e.advisor_id === filterGestor);
    return matchSearch && matchStatus && matchGestor;
  });

  const openDetail = (exp: Expediente) => {
    setSelectedExp(exp);
    setDetailStatus(exp.status);
    setDetailAdvisorId(exp.advisor_id ?? "__none__");
    setNotes(exp.internal_notes ?? "");
  };

  const saveChanges = async () => {
    if (!selectedExp || !user) return;
    const effectiveAdvisorId = detailAdvisorId === "__none__" ? null : detailAdvisorId;
    const advisorChanged = effectiveAdvisorId && effectiveAdvisorId !== (selectedExp.advisor_id ?? null);
    const { error } = await updateExpediente(selectedExp.id, {
      status: detailStatus,
      internal_notes: notes || null,
      advisor_id: effectiveAdvisorId,
    });
    if (!error) {
      if (advisorChanged) {
        await notifyGestorAssignment({
          advisorId: detailAdvisorId,
          tramiteName: selectedExp.tramites_catalog?.name ?? selectedExp.tramite_code,
          userName: "Cliente del expediente",
          expedienteId: selectedExp.id,
          createdBy: user.id,
        });
      }
      toast({ title: "Guardado", description: `Expediente actualizado.` });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSelectedExp(null);
  };

  const handleDelete = async () => {
    if (!selectedExp) return;
    setDeleting(true);
    const { error } = await deleteExpediente(selectedExp.id);
    setDeleting(false);
    if (!error) {
      toast({ title: "Eliminado", description: "Expediente y documentos asociados eliminados." });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setShowDeleteConfirm(false);
    setSelectedExp(null);
  };

  const statusCounts = allStatuses.map((s) => ({
    status: s,
    label: statusLabels[s],
    count: expedientes.filter((e) => e.status === s).length,
  }));

  const getGestorName = (advisorId: string | null) => {
    if (!advisorId) return "Sin asignar";
    const g = gestores.find(g => g.id === advisorId);
    return g?.full_name ?? g?.email ?? "Desconocido";
  };

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="flex gap-2 flex-wrap">
        {statusCounts.filter(s => s.count > 0).map((s) => (
          <button
            key={s.status}
            onClick={() => setFilterStatus(filterStatus === s.status ? "all" : s.status)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              filterStatus === s.status ? "ring-2 ring-offset-1 ring-primary" : ""
            } ${statusColor(s.status)}`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por trámite o nº expediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={filterGestor} onValueChange={setFilterGestor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar gestor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los gestores</SelectItem>
              <SelectItem value="none">Sin asignar</SelectItem>
              {gestores.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Trámite</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Nº Expediente</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Gestor</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">País</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Documentos</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Creado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Cargando expedientes...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No se encontraron expedientes.</td></tr>
            ) : filtered.map((exp) => (
              <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{exp.tramites_catalog?.name ?? exp.tramite_code}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{exp.expediente_number ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(exp.status)}`}>
                    {statusLabels[exp.status] ?? exp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{getGestorName(exp.advisor_id)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{exp.origin_country ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{exp.documentos?.length ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(exp.created_at).toLocaleDateString("es-ES")}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openDetail(exp)}>
                    <Eye size={12} /> Gestionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedExp} onOpenChange={() => setSelectedExp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expediente {selectedExp?.expediente_number ?? selectedExp?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedExp && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Datos del trámite</h4>
                  <p className="text-muted-foreground">Tipo: <span className="text-foreground">{selectedExp.tramites_catalog?.name ?? selectedExp.tramite_code}</span></p>
                  <p className="text-muted-foreground">País origen: <span className="text-foreground">{selectedExp.origin_country ?? "—"}</span></p>
                  <p className="text-muted-foreground">Tipo solicitud: <span className="text-foreground">{selectedExp.solicitud_type ?? "—"}</span></p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Fechas</h4>
                  <p className="text-muted-foreground">Creado: <span className="text-foreground">{new Date(selectedExp.created_at).toLocaleDateString("es-ES")}</span></p>
                  <p className="text-muted-foreground">Presentado: <span className="text-foreground">{selectedExp.submitted_at ? new Date(selectedExp.submitted_at).toLocaleDateString("es-ES") : "—"}</span></p>
                  <p className="text-muted-foreground">Resuelto: <span className="text-foreground">{selectedExp.resolved_at ? new Date(selectedExp.resolved_at).toLocaleDateString("es-ES") : "—"}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Estado</Label>
                <Select value={detailStatus} onValueChange={(v) => setDetailStatus(v as ExpedienteStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Gestor selector: editable for admin, read-only for gestor */}
              <div className="space-y-2">
                <Label className="text-sm">Gestor asignado</Label>
                {isAdmin ? (
                  <Select value={detailAdvisorId} onValueChange={setDetailAdvisorId}>
                    <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin asignar</SelectItem>
                      {gestores.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email ?? g.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-foreground bg-muted/50 rounded px-3 py-2">
                    {getGestorName(selectedExp.advisor_id)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Notas internas</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añadir notas internas..." rows={3} />
              </div>

              {selectedExp.documentos && selectedExp.documentos.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Documentos ({selectedExp.documentos.length})</Label>
                  <div className="space-y-1">
                    {selectedExp.documentos.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-3 py-2">
                        <span className="text-foreground">{doc.file_name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            doc.status === 'validado' ? 'text-success' : doc.status === 'rechazado' ? 'text-destructive' : 'text-warning'
                          }`}>{doc.status}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Download size={12} /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              {isAdmin && (
                <Button variant="destructive" size="sm" className="gap-1" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> Eliminar expediente
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedExp(null)}>Cerrar</Button>
              <Button onClick={saveChanges}>Guardar cambios</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el expediente y todos sus documentos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExpedientes;
