import { useState } from "react";
import { Search, Filter, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useExpedientes } from "@/hooks/useExpedientes";
import { Expediente, ExpedienteStatus } from "@/types/database.types";

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
  const { expedientes, loading, updateExpediente } = useExpedientes();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [detailStatus, setDetailStatus] = useState<ExpedienteStatus>("no_iniciado");
  const [notes, setNotes] = useState("");

  const filtered = expedientes.filter((e) => {
    const matchSearch =
      !search ||
      (e.tramites_catalog?.name ?? e.tramite_code).toLowerCase().includes(search.toLowerCase()) ||
      (e.expediente_number ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = (exp: Expediente) => {
    setSelectedExp(exp);
    setDetailStatus(exp.status);
    setNotes(exp.internal_notes ?? "");
  };

  const saveChanges = async () => {
    if (!selectedExp) return;
    const { error } = await updateExpediente(selectedExp.id, {
      status: detailStatus,
      internal_notes: notes || null,
    });
    if (!error) {
      toast({ title: "Guardado", description: `Expediente actualizado.` });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSelectedExp(null);
  };

  const statusCounts = allStatuses.map((s) => ({
    status: s,
    label: statusLabels[s],
    count: expedientes.filter((e) => e.status === s).length,
  }));

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
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Trámite</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Nº Expediente</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">País</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Documentos</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Creado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Cargando expedientes...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No se encontraron expedientes.</td></tr>
            ) : filtered.map((exp) => (
              <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{exp.tramites_catalog?.name ?? exp.tramite_code}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{exp.expediente_number ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(exp.status)}`}>
                    {statusLabels[exp.status] ?? exp.status}
                  </span>
                </td>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedExp(null)}>Cerrar</Button>
            <Button onClick={saveChanges}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExpedientes;
