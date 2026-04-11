import { useState, useEffect } from "react";
import { Eye, Download, Trash2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Expediente, ExpedienteStatus, Documento } from "@/types/database.types";
import { Gestor } from "@/hooks/useGestores";
import { allStatuses, statusLabels } from "@/lib/expediente-utils";
import { getGestorName } from "@/hooks/useGestores";

interface ExpedienteDetailDialogProps {
  expediente: Expediente | null;
  gestores: Gestor[];
  isAdmin: boolean;
  onSave: (data: { status: ExpedienteStatus; advisorId: string | null; notes: string | null }) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
  onValidateDoc?: (docId: string) => Promise<void>;
  onRejectDoc?: (docId: string) => void;
  onResetDoc?: (docId: string) => Promise<void>;
  onDownloadDoc?: (doc: Documento) => Promise<void>;
  showDocumentActions?: boolean;
}

const ExpedienteDetailDialog = ({
  expediente,
  gestores,
  isAdmin,
  onSave,
  onDelete,
  onClose,
  onValidateDoc,
  onRejectDoc,
  onResetDoc,
  onDownloadDoc,
  showDocumentActions = false,
}: ExpedienteDetailDialogProps) => {
  const [detailStatus, setDetailStatus] = useState<ExpedienteStatus>("no_iniciado");
  const [detailAdvisorId, setDetailAdvisorId] = useState<string>("__none__");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (expediente) {
      setDetailStatus(expediente.status);
      setDetailAdvisorId(expediente.advisor_id ?? "__none__");
      setNotes(expediente.internal_notes ?? "");
    }
  }, [expediente]);

  const handleSave = async () => {
    const effectiveAdvisorId = detailAdvisorId === "__none__" ? null : detailAdvisorId;
    await onSave({
      status: detailStatus,
      advisorId: effectiveAdvisorId,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={!!expediente} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expediente {expediente?.expediente_number ?? expediente?.id?.slice(0, 8)}</DialogTitle>
        </DialogHeader>
        {expediente && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Datos del trámite</h4>
                <p className="text-muted-foreground">Tipo: <span className="text-foreground">{expediente.tramites_catalog?.name ?? expediente.tramite_code}</span></p>
                <p className="text-muted-foreground">Nº Expediente: <span className="text-foreground">{expediente.expediente_number ?? "—"}</span></p>
                <p className="text-muted-foreground">País origen: <span className="text-foreground">{expediente.origin_country ?? "—"}</span></p>
                {expediente.solicitud_type && (
                  <p className="text-muted-foreground">Tipo solicitud: <span className="text-foreground">{expediente.solicitud_type}</span></p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Fechas</h4>
                <p className="text-muted-foreground">Creado: <span className="text-foreground">{new Date(expediente.created_at).toLocaleDateString("es-ES")}</span></p>
                <p className="text-muted-foreground">Presentado: <span className="text-foreground">{expediente.submitted_at ? new Date(expediente.submitted_at).toLocaleDateString("es-ES") : "—"}</span></p>
                <p className="text-muted-foreground">Resuelto: <span className="text-foreground">{expediente.resolved_at ? new Date(expediente.resolved_at).toLocaleDateString("es-ES") : "—"}</span></p>
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
                  {getGestorName(gestores, expediente.advisor_id)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Notas internas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añadir notas internas..." rows={3} />
            </div>

            {expediente.documentos && expediente.documentos.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Documentos ({expediente.documentos.length})</Label>
                <div className="space-y-1.5">
                  {expediente.documentos.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-3 py-2.5 gap-2">
                      <span className="text-foreground truncate flex-1">{doc.file_name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-medium px-1.5 py-0.5 rounded text-[10px] ${
                          doc.status === 'validado' ? 'bg-success/10 text-success' :
                          doc.status === 'rechazado' ? 'bg-destructive/10 text-destructive' :
                          doc.status === 'en_revision' ? 'bg-secondary/10 text-secondary' :
                          'bg-warning/10 text-warning'
                        }`}>{doc.status}</span>
                        {showDocumentActions && doc.rejection_reason && (
                          <span className="text-destructive text-[10px] max-w-[120px] truncate" title={doc.rejection_reason}>
                            ({doc.rejection_reason})
                          </span>
                        )}
                        {showDocumentActions && onDownloadDoc && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Descargar" onClick={() => onDownloadDoc(doc)}>
                            <Download size={12} />
                          </Button>
                        )}
                        {showDocumentActions && onValidateDoc && doc.status !== 'validado' && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-success hover:text-success" title="Validar" onClick={() => onValidateDoc(doc.id)}>
                            <CheckCircle2 size={13} />
                          </Button>
                        )}
                        {showDocumentActions && onRejectDoc && doc.status !== 'rechazado' && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" title="Rechazar" onClick={() => onRejectDoc(doc.id)}>
                            <XCircle size={13} />
                          </Button>
                        )}
                        {showDocumentActions && onResetDoc && (doc.status === 'validado' || doc.status === 'rechazado') && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" title="Devolver a pendiente" onClick={() => onResetDoc(doc.id)}>
                            <RotateCcw size={12} />
                          </Button>
                        )}
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
              <Button variant="destructive" size="sm" className="gap-1" onClick={onDelete}>
                <Trash2 size={14} /> Eliminar expediente
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpedienteDetailDialog;
