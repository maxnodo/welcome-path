import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlertas } from "@/hooks/useAlertas";
import { Alerta, AlertaType } from "@/types/database.types";

const alertConfig: Record<AlertaType, { icon: typeof AlertTriangle; iconColor: string; labelColor: string; btnColor: string }> = {
  urgente: { icon: AlertTriangle, iconColor: "text-destructive", labelColor: "text-destructive", btnColor: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
  recordatorio: { icon: Calendar, iconColor: "text-secondary", labelColor: "text-secondary", btnColor: "bg-secondary text-secondary-foreground hover:bg-secondary/90" },
  presentacion_pendiente: { icon: Bell, iconColor: "text-warning", labelColor: "text-warning", btnColor: "bg-warning text-warning-foreground hover:bg-warning/90" },
  resolucion: { icon: CheckCircle, iconColor: "text-success", labelColor: "text-success", btnColor: "bg-success text-success-foreground hover:bg-success/90" },
};

const Alertas = () => {
  const navigate = useNavigate();
  const { alertas, loading, markAsRead, markAllAsRead } = useAlertas();
  const [filterTramite, setFilterTramite] = useState("todos");
  const [filterRead, setFilterRead] = useState("todas");

  const tramites = [...new Set(alertas.map((a) => a.expediente?.tramites_catalog?.name ?? a.expediente_id ?? "General").filter(Boolean))];

  const getTramiteName = (a: Alerta) => a.expediente?.tramites_catalog?.name ?? "General";

  const filtered = alertas.filter((a) => {
    if (filterTramite !== "todos" && getTramiteName(a) !== filterTramite) return false;
    if (filterRead === "pendientes" && a.is_read) return false;
    if (filterRead === "leidas" && !a.is_read) return false;
    return true;
  });

  if (loading) {
    return <div className="max-w-4xl"><p className="text-sm text-muted-foreground">Cargando alertas...</p></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Aquí recibirás notificaciones importantes sobre el estado de tus trámites, requerimientos oficiales, vencimientos y resoluciones. Atiende las alertas indicadas para continuar el proceso correctamente.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterTramite} onValueChange={setFilterTramite}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los trámites</SelectItem>
            {tramites.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRead} onValueChange={setFilterRead}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendientes">Pendientes</SelectItem>
            <SelectItem value="leidas">Leídas</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>Marcar todas como leídas</Button>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const cfg = alertConfig[alert.type] ?? alertConfig.recordatorio;
          const Icon = cfg.icon;
          const timeDiff = new Date().getTime() - new Date(alert.created_at).getTime();
          const minutes = Math.floor(timeDiff / 60000);
          const timeLabel = minutes < 60 ? `Hace ${minutes} min` : minutes < 1440 ? `Hace ${Math.floor(minutes / 60)}h` : new Date(alert.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long" });

          return (
            <div
              key={alert.id}
              className={`bg-card rounded-lg border shadow-sm p-4 flex gap-4 transition-all ${
                !alert.is_read ? "border-l-4 border-l-secondary" : "opacity-80"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconColor} bg-current/10`}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-sm font-semibold ${cfg.labelColor}`}>{alert.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeLabel}</span>
                </div>
                <p className="text-xs text-muted-foreground">{getTramiteName(alert)}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-3 pt-2">
                  {alert.action_url && (
                    <button
                      onClick={() => navigate(alert.action_url!)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-md ${cfg.btnColor}`}
                    >
                      {alert.action_label ?? "Ver"} &gt;
                    </button>
                  )}
                  {!alert.is_read && (
                    <button onClick={() => markAsRead(alert.id)} className="text-xs text-muted-foreground hover:text-foreground">
                      Marcar como leída &gt;
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay alertas que mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default Alertas;
