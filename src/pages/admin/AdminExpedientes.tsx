import { useState } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useDocumentos } from "@/hooks/useDocumentos";
import { useGestores, getGestorName } from "@/hooks/useGestores";
import { useAuth } from "@/context/AuthContext";
import { Expediente, ExpedienteStatus, Documento } from "@/types/database.types";
import { notifyGestorAssignment } from "@/lib/notifyGestorAssignment";
import { allStatuses, statusLabels, statusColor } from "@/lib/expediente-utils";
import ExpedienteDetailDialog from "@/components/admin/ExpedienteDetailDialog";
import DeleteExpedienteDialog from "@/components/admin/DeleteExpedienteDialog";
import RejectDocumentDialog from "@/components/admin/RejectDocumentDialog";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);

  const filtered = expedientes.filter((e) => {
    const matchSearch =
      !search ||
      (e.tramites_catalog?.name ?? e.tramite_code).toLowerCase().includes(search.toLowerCase()) ||
      (e.expediente_number ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    const matchGestor = filterGestor === "all" || (filterGestor === "no_user" ? !e.user_id : filterGestor === "none" ? !e.advisor_id : e.advisor_id === filterGestor);
    return matchSearch && matchStatus && matchGestor;
  });

  const handleSave = async (data: { status: ExpedienteStatus; advisorId: string | null; notes: string | null }) => {
    if (!selectedExp || !user) return;
    const advisorChanged = data.advisorId && data.advisorId !== (selectedExp.advisor_id ?? null);
    const { error } = await updateExpediente(selectedExp.id, {
      status: data.status,
      internal_notes: data.notes,
      advisor_id: data.advisorId,
    });
    if (!error) {
      if (advisorChanged) {
        await notifyGestorAssignment({
          advisorId: data.advisorId!,
          tramiteName: selectedExp.tramites_catalog?.name ?? selectedExp.tramite_code,
          userName: "Cliente del expediente",
          expedienteId: selectedExp.id,
          createdBy: user.id,
        });
      }
      toast({ title: "Guardado", description: "Expediente actualizado." });
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

  const refreshSelectedExp = (docId: string, newStatus: string, reason?: string | null) => {
    if (!selectedExp?.documentos) return;
    setSelectedExp({
      ...selectedExp,
      documentos: selectedExp.documentos.map(d =>
        d.id === docId ? { ...d, status: newStatus as any, rejection_reason: reason ?? null } : d
      ),
    });
  };

  const handleValidateDoc = async (docId: string) => {
    const { error } = await updateDocumentStatus(docId, 'validado');
    if (!error) {
      toast({ title: "Documento validado" });
      refreshSelectedExp(docId, 'validado');
      refetch();
    } else {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleRejectDoc = async (reason: string) => {
    if (!rejectingDocId) return;
    const { error } = await updateDocumentStatus(rejectingDocId, 'rechazado', reason);
    if (!error) {
      toast({ title: "Documento rechazado" });
      refreshSelectedExp(rejectingDocId, 'rechazado', reason);
      refetch();
    } else {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
    setRejectingDocId(null);
  };

  const handleResetDocStatus = async (docId: string) => {
    const { error } = await updateDocumentStatus(docId, 'pendiente');
    if (!error) {
      toast({ title: "Documento devuelto a pendiente" });
      refreshSelectedExp(docId, 'pendiente');
      refetch();
    } else {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleDownloadDoc = async (doc: Documento) => {
    const url = await getDocumentUrl(doc.file_path);
    if (url) window.open(url, '_blank');
    else toast({ title: "Error", description: "No se pudo obtener el enlace del documento.", variant: "destructive" });
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
                <td className="px-4 py-3 text-muted-foreground text-xs">{getGestorName(gestores, exp.advisor_id)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{exp.origin_country ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{exp.documentos?.length ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(exp.created_at).toLocaleDateString("es-ES")}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setSelectedExp(exp)}>
                    <Eye size={12} /> Gestionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExpedienteDetailDialog
        expediente={selectedExp}
        gestores={gestores}
        isAdmin={isAdmin}
        onSave={handleSave}
        onDelete={() => setShowDeleteConfirm(true)}
        onClose={() => setSelectedExp(null)}
        onValidateDoc={handleValidateDoc}
        onRejectDoc={(docId) => setRejectingDocId(docId)}
        onResetDoc={handleResetDocStatus}
        onDownloadDoc={handleDownloadDoc}
        showDocumentActions
      />

      <RejectDocumentDialog
        open={!!rejectingDocId}
        onOpenChange={(open) => { if (!open) setRejectingDocId(null); }}
        onConfirm={handleRejectDoc}
      />

      <DeleteExpedienteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
};

export default AdminExpedientes;
