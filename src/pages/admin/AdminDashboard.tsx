import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Calendar, AlertTriangle, Eye, UserPlus, Send, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useToast } from "@/hooks/use-toast";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useAlertas } from "@/hooks/useAlertas";
import { useAdminCitas } from "@/hooks/useAdminCitas";
import { useGestores, getGestorName } from "@/hooks/useGestores";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Expediente, ExpedienteStatus, AlertaType, Cita, Profile } from "@/types/database.types";
import { notifyGestorAssignment } from "@/lib/notifyGestorAssignment";
import { allStatuses, statusLabels, statusColor } from "@/lib/expediente-utils";
import ExpedienteDetailDialog from "@/components/admin/ExpedienteDetailDialog";
import DeleteExpedienteDialog from "@/components/admin/DeleteExpedienteDialog";

const alertaTypes: { value: AlertaType; label: string }[] = [
  { value: "urgente", label: "Urgente" },
  { value: "recordatorio", label: "Recordatorio" },
  { value: "presentacion_pendiente", label: "Presentación pendiente" },
  { value: "resolucion", label: "Resolución" },
];

const INACTIVE_STATUSES = ["archivado", "denegado", "finalizado"];

const getUtcWeekRange = () => {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysFromMonday = (utcDay + 6) % 7;

  const weekStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysFromMonday,
    0, 0, 0, 0,
  ));

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  return { weekStart, weekEnd };
};

const isCitaInCurrentWeek = (cita: Cita) => {
  const citaDate = new Date(cita.scheduled_at);
  const { weekStart, weekEnd } = getUtcWeekRange();
  return citaDate >= weekStart && citaDate < weekEnd && cita.status !== "cancelada";
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { expedientes, loading, updateExpediente, deleteExpediente } = useExpedientes();
  const { alertas } = useAlertas();
  const { citas } = useAdminCitas();
  const { gestores } = useGestores();
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New expediente dialog
  const [showNewExp, setShowNewExp] = useState(false);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [tramites, setTramites] = useState<{ id: string; code: string; name: string }[]>([]);
  const [newExpUserId, setNewExpUserId] = useState("");
  const [newExpTramite, setNewExpTramite] = useState("");
  const [newExpAdvisorId, setNewExpAdvisorId] = useState("");
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

  const currentWeekCitas = citas.filter(isCitaInCurrentWeek);

  const workloadData = gestores.map(g => {
    const assigned = expedientes.filter(e => e.advisor_id === g.id);
    const active = assigned.filter(e => !INACTIVE_STATUSES.includes(e.status)).length;
    const pendingReview = assigned.filter(e => e.status === "en_revision").length;
    const weeklyCitas = currentWeekCitas.filter(c => c.advisor_id === g.id).length;
    return { ...g, active, pendingReview, weeklyCitas, total: assigned.length };
  });

  const kpis = [
    { label: "Expedientes activos", value: expedientes.filter(e => !INACTIVE_STATUSES.includes(e.status)).length, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Pendientes revisión", value: expedientes.filter(e => e.status === "en_revision").length, icon: Clock, color: "text-warning bg-warning/10" },
    { label: "Citas esta semana", value: currentWeekCitas.length, icon: Calendar, color: "text-primary bg-primary/10" },
    { label: "Alertas urgentes", value: alertas.filter(a => a.type === "urgente" && !a.is_read).length, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
  ];

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
      toast({ title: "Cambios guardados", description: `Expediente ${selectedExp.expediente_number ?? selectedExp.id} actualizado.` });
    } else {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    }
    setSelectedExp(null);
  };

  const handleDeleteExpediente = async () => {
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

  const handleCreateExpediente = async () => {
    if (!newExpUserId || !newExpTramite || !newExpAdvisorId || !user) return;
    setCreatingExp(true);
    const { data, error } = await supabase.from('expedientes').insert({
      user_id: newExpUserId,
      tramite_code: newExpTramite,
      status: 'no_iniciado' as ExpedienteStatus,
      advisor_id: newExpAdvisorId,
    }).select('*, tramites_catalog(*)').single();
    setCreatingExp(false);
    if (!error) {
      const tramiteName = data?.tramites_catalog?.name ?? newExpTramite;
      const assignedUser = allUsers.find(u => u.id === newExpUserId);
      await notifyGestorAssignment({
        advisorId: newExpAdvisorId,
        tramiteName,
        userName: assignedUser?.full_name ?? assignedUser?.email ?? "Nuevo usuario",
        expedienteId: data?.id ?? null,
        createdBy: user.id,
      });
      toast({ title: "Expediente creado", description: "El expediente se ha creado y el gestor ha sido notificado." });
      setShowNewExp(false);
      setNewExpUserId("");
      setNewExpTramite("");
      setNewExpAdvisorId("");
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

      {/* Workload card grid — admin only */}
      {isAdmin && workloadData.length > 0 && (() => {
        const totalActive = workloadData.reduce((s, w) => s + w.active, 0);
        const avgLoad = workloadData.length ? (totalActive / workloadData.length).toFixed(1) : "0";
        const overloaded = workloadData.filter(w => w.active >= 7).length;
        const getLoadColor = (active: number) => {
          if (active >= 7) return { border: "border-l-destructive", ring: "hsl(0 72% 51%)", label: "Alta" };
          if (active >= 4) return { border: "border-l-warning", ring: "hsl(32 95% 44%)", label: "Media" };
          return { border: "border-l-success", ring: "hsl(142 72% 29%)", label: "Baja" };
        };
        const capacity = 10;

        return (
          <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Users size={16} /> Carga de trabajo por gestor
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/50 rounded-lg px-4 py-2.5">
              <span className="text-muted-foreground">
                Total activos: <span className="font-semibold text-foreground">{totalActive}</span>
              </span>
              <span className="text-muted-foreground">
                Promedio: <span className="font-semibold text-foreground">{avgLoad}/gestor</span>
              </span>
              {overloaded > 0 && (
                <span className="text-destructive font-medium">
                  ⚠ {overloaded} sobrecargado{overloaded > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {workloadData.map(w => {
                const load = getLoadColor(w.active);
                const pct = Math.min((w.active / capacity) * 100, 100);
                const deg = (pct / 100) * 360;

                return (
                  <div
                    key={w.id}
                    className={`min-w-[180px] flex-shrink-0 bg-card rounded-lg border border-l-4 ${load.border} shadow-sm p-4 flex flex-col items-center gap-3`}
                  >
                    <p className="text-sm font-medium text-foreground truncate w-full text-center">
                      {w.full_name ?? w.email ?? "Sin nombre"}
                    </p>

                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(${load.ring} ${deg}deg, hsl(var(--muted)) ${deg}deg)`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                        <span className="text-base font-bold text-foreground">{w.active}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded-full font-medium">{w.pendingReview} rev</span>
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{w.weeklyCitas} cit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Expedientes table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Expedientes recientes</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Trámite</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Gestor</th>
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
                <td className="px-4 py-3 text-muted-foreground text-xs">{getGestorName(gestores, exp.advisor_id)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setSelectedExp(exp)}>
                    <Eye size={12} /> Ver
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
      />

      <DeleteExpedienteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteExpediente}
        deleting={deleting}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => setShowNewExp(true)}>
              <UserPlus size={20} />
              <span className="text-xs">Nuevo expediente</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Crear un nuevo expediente asignándolo a un usuario y gestor</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => setShowMassAlert(true)}>
              <Send size={20} />
              <span className="text-xs">Alerta masiva</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Enviar una alerta a múltiples usuarios</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5" onClick={() => navigate("/admin/citas")}>
              <Calendar size={20} />
              <span className="text-xs">Ver agenda</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ir a la vista de citas y agenda</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-1.5 opacity-50" disabled>
              <BarChart3 size={20} />
              <span className="text-xs">Generar informe</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Próximamente</TooltipContent>
        </Tooltip>
      </div>

      {/* Pending alerts */}
      {pendingAlerts.length > 0 && (
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Alertas pendientes</h3>
          <div className="space-y-2">
            {pendingAlerts.map(a => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  a.type === 'urgente' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                }`}>{a.type}</span>
                <span className="text-foreground">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="space-y-2">
              <Label className="text-sm">Gestor asignado</Label>
              <Select value={newExpAdvisorId} onValueChange={setNewExpAdvisorId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar gestor" /></SelectTrigger>
                <SelectContent>
                  {gestores.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email ?? g.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExp(false)}>Cancelar</Button>
            <Button onClick={handleCreateExpediente} disabled={creatingExp || !newExpUserId || !newExpTramite || !newExpAdvisorId}>
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
