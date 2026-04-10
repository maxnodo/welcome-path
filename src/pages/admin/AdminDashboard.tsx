import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Calendar, AlertTriangle, Eye, UserPlus, Send, BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useAlertas } from "@/hooks/useAlertas";
import { useCitas } from "@/hooks/useCitas";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Expediente, ExpedienteStatus, AlertaType, Profile } from "@/types/database.types";

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

const alertaTypes: { value: AlertaType; label: string }[] = [
  { value: "urgente", label: "Urgente" },
  { value: "recordatorio", label: "Recordatorio" },
  { value: "presentacion_pendiente", label: "Presentación pendiente" },
  { value: "resolucion", label: "Resolución" },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expedientes, loading, updateExpediente } = useExpedientes();
  const { alertas } = useAlertas();
  const { citas } = useCitas();
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [detailStatus, setDetailStatus] = useState<ExpedienteStatus>("no_iniciado");
  const [notes, setNotes] = useState("");

  // New expediente dialog
  const [showNewExp, setShowNewExp] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [tramites, setTramites] = useState<{ id: string; code: string; name: string }[]>([]);
  const [newExpUserId, setNewExpUserId] = useState("");
  const [newExpTramite, setNewExpTramite] = useState("");
  const [creatingExp, setCreatingExp] = useState(false);

  // Mass alert dialog
  const [showMassAlert, setShowMassAlert] = useState(false);
  const [alertType, setAlertType] = useState<AlertaType>("recordatorio");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDesc, setAlertDesc] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, email, role').eq('role', 'user').then(({ data }) => {
      setAllUsers((data as Profile[]) ?? []);
    });
    supabase.from('tramites_catalog').select('id, code, name').eq('is_active', true).then(({ data }) => {
      setTramites(data ?? []);
    });
  }, []);

  const kpis = [
    { label: "Expedientes activos", value: expedientes.filter(e => !["archivado", "denegado", "finalizado"].includes(e.status)).length, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Pendientes revisión", value: expedientes.filter(e => e.status === "en_revision").length, icon: Clock, color: "text-warning bg-warning/10" },
    { label: "Citas esta semana", value: citas.length, icon: Calendar, color: "text-primary bg-primary/10" },
    { label: "Alertas urgentes", value: alertas.filter(a => a.type === "urgente" && !a.is_read).length, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  ];

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
      toast({ title: "Cambios guardados", description: `Expediente ${selectedExp.expediente_number ?? selectedExp.id} actualizado.` });
    } else {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    }
    setSelectedExp(null);
  };

  const handleCreateExpediente = async () => {
    if (!newExpUserId || !newExpTramite) return;
    setCreatingExp(true);
    const { error } = await supabase.from('expedientes').insert({
      user_id: newExpUserId,
      tramite_code: newExpTramite,
      status: 'no_iniciado' as ExpedienteStatus,
    });
    setCreatingExp(false);
    if (!error) {
      toast({ title: "Expediente creado", description: "El expediente se ha creado correctamente." });
      setShowNewExp(false);
      setNewExpUserId("");
      setNewExpTramite("");
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSendMassAlert = async () => {
    if (!alertTitle || selectedUserIds.length === 0 || !user) return;
    setSendingAlert(true);
    const alertRows = selectedUserIds.map(uid => ({
      user_id: uid,
      title: alertTitle,
      type: alertType,
      description: alertDesc || null,
      created_by: user.id,
    }));
    const { error } = await supabase.from('alertas').insert(alertRows);
    setSendingAlert(false);
    if (!error) {
      toast({ title: "Alertas enviadas", description: `Se enviaron ${selectedUserIds.length} alertas.` });
      setShowMassAlert(false);
      setAlertTitle("");
      setAlertDesc("");
      setSelectedUserIds([]);
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const pendingAlerts = alertas.filter(a => !a.is_read).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card rounded-lg border shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expedientes table */}
        <div className="lg:col-span-2 bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground">Expedientes recientes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Trámite</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Expediente</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
              ) : expedientes.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay expedientes.</td></tr>
              ) : expedientes.slice(0, 10).map((exp) => (
                <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{exp.tramites_catalog?.name ?? exp.tramite_code}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(exp.status)}`}>
                      {statusLabels[exp.status] ?? exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{exp.expediente_number ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openDetail(exp)}>
                      <Eye size={12} /> Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border shadow-sm p-4 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Acciones rápidas</h3>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs" onClick={() => setShowNewExp(true)}>
              <UserPlus size={14} /> Nuevo expediente
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs" onClick={() => setShowMassAlert(true)}>
              <Send size={14} /> Enviar alerta masiva
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs" onClick={() => navigate("/admin/citas")}>
              <Calendar size={14} /> Ver agenda del día
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button variant="outline" className="w-full justify-start gap-2 text-xs" disabled>
                    <BarChart3 size={14} /> Generar informe
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Próximamente</TooltipContent>
            </Tooltip>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Alertas pendientes</h3>
            {pendingAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay alertas pendientes.</p>
            ) : pendingAlerts.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                  a.type === 'urgente' ? 'bg-destructive' : a.type === 'recordatorio' ? 'bg-warning' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-xs">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedExp} onOpenChange={() => setSelectedExp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expediente {selectedExp?.expediente_number ?? selectedExp?.id}</DialogTitle>
          </DialogHeader>
          {selectedExp && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Datos del trámite</h4>
                  <p className="text-muted-foreground">Tipo: <span className="text-foreground">{selectedExp.tramites_catalog?.name ?? selectedExp.tramite_code}</span></p>
                  <p className="text-muted-foreground">Nº Expediente: <span className="text-foreground">{selectedExp.expediente_number ?? "—"}</span></p>
                  <p className="text-muted-foreground">País origen: <span className="text-foreground">{selectedExp.origin_country ?? "—"}</span></p>
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
                <Label className="text-sm">Notas internas (no visibles para el cliente)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añadir notas internas..." rows={3} />
              </div>
              {selectedExp.documentos && selectedExp.documentos.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Documentos ({selectedExp.documentos.length})</Label>
                  <div className="space-y-1">
                    {selectedExp.documentos.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-3 py-2">
                        <span className="text-foreground">{doc.file_name}</span>
                        <span className={`font-medium ${
                          doc.status === 'validado' ? 'text-success' : doc.status === 'rechazado' ? 'text-destructive' : 'text-warning'
                        }`}>{doc.status}</span>
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

      {/* New expediente dialog */}
      <Dialog open={showNewExp} onOpenChange={setShowNewExp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo expediente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Usuario</Label>
              <Select value={newExpUserId} onValueChange={setNewExpUserId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                <SelectContent>
                  {allUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email ?? u.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Trámite</Label>
              <Select value={newExpTramite} onValueChange={setNewExpTramite}>
                <SelectTrigger><SelectValue placeholder="Seleccionar trámite" /></SelectTrigger>
                <SelectContent>
                  {tramites.map(t => (
                    <SelectItem key={t.id} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExp(false)}>Cancelar</Button>
            <Button onClick={handleCreateExpediente} disabled={creatingExp || !newExpUserId || !newExpTramite}>
              {creatingExp ? "Creando..." : "Crear expediente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass alert dialog */}
      <Dialog open={showMassAlert} onOpenChange={setShowMassAlert}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar alerta masiva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Tipo</Label>
              <Select value={alertType} onValueChange={(v) => setAlertType(v as AlertaType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {alertaTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Título</Label>
              <Input value={alertTitle} onChange={e => setAlertTitle(e.target.value)} placeholder="Título de la alerta" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Descripción (opcional)</Label>
              <Textarea value={alertDesc} onChange={e => setAlertDesc(e.target.value)} placeholder="Descripción..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Destinatarios ({selectedUserIds.length} seleccionados)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                <div className="flex items-center gap-2 pb-1 border-b mb-1">
                  <Checkbox
                    checked={selectedUserIds.length === allUsers.length && allUsers.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedUserIds(checked ? allUsers.map(u => u.id) : []);
                    }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">Seleccionar todos</span>
                </div>
                {allUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedUserIds.includes(u.id)}
                      onCheckedChange={() => toggleUserSelection(u.id)}
                    />
                    <span className="text-sm">{u.full_name ?? u.email ?? u.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMassAlert(false)}>Cancelar</Button>
            <Button onClick={handleSendMassAlert} disabled={sendingAlert || !alertTitle || selectedUserIds.length === 0}>
              {sendingAlert ? "Enviando..." : `Enviar a ${selectedUserIds.length} usuarios`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
