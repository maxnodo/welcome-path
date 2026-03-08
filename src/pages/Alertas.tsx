import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AlertType = "urgente" | "recordatorio" | "pendiente" | "resuelto";

interface Alert {
  id: string;
  type: AlertType;
  typeLabel: string;
  subtitle: string;
  tramite: string;
  time: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  read: boolean;
}

const alertConfig: Record<AlertType, { icon: typeof AlertTriangle; iconColor: string; labelColor: string; btnColor: string }> = {
  urgente: { icon: AlertTriangle, iconColor: "text-destructive", labelColor: "text-destructive", btnColor: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
  recordatorio: { icon: Calendar, iconColor: "text-secondary", labelColor: "text-secondary", btnColor: "bg-secondary text-secondary-foreground hover:bg-secondary/90" },
  pendiente: { icon: Bell, iconColor: "text-warning", labelColor: "text-warning", btnColor: "bg-warning text-warning-foreground hover:bg-warning/90" },
  resuelto: { icon: CheckCircle, iconColor: "text-success", labelColor: "text-success", btnColor: "bg-success text-success-foreground hover:bg-success/90" },
};

const initialAlerts: Alert[] = [
  {
    id: "1", type: "urgente", typeLabel: "Requerimiento urgente", subtitle: "Falta pasaporte completo",
    tramite: "Nacionalidad Española", time: "Hace 20 min",
    description: "Falta subir una copia completa en vigor de tu pasaporte.",
    actionLabel: "Subir documento", actionPath: "/tramites", read: false,
  },
  {
    id: "2", type: "recordatorio", typeLabel: "Recordatorio", subtitle: "La fecha de tu DNI está próxima a caducar",
    tramite: "DNI", time: "Ayer",
    description: "Renueva tu Documento Nacional de Identidad (DNI) para evitar problemas.",
    actionLabel: "Programar cita", actionPath: "/citas", read: false,
  },
  {
    id: "3", type: "pendiente", typeLabel: "Presentación pendiente", subtitle: "Envía la documentación para completar la...",
    tramite: "NIE", time: "23 abril",
    description: "Aún falta enviar la documentación para completar la solicitud.",
    actionLabel: "Realizar envío", actionPath: "/tramites", read: false,
  },
  {
    id: "4", type: "resuelto", typeLabel: "Nacionalidad española aprobada", subtitle: "Nacionalidad Española",
    tramite: "Nacionalidad Española", time: "20 abril",
    description: "Tu solicitud de nacionalidad ha sido aprobada.",
    actionLabel: "Consultar resolución", actionPath: "/historico", read: true,
  },
];

const Alertas = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filterTramite, setFilterTramite] = useState("todos");
  const [filterRead, setFilterRead] = useState("todas");

  const markRead = (id: string) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, read: true } : a)));
  const markAllRead = () => setAlerts((p) => p.map((a) => ({ ...a, read: true })));

  const tramites = [...new Set(alerts.map((a) => a.tramite))];

  const filtered = alerts.filter((a) => {
    if (filterTramite !== "todos" && a.tramite !== filterTramite) return false;
    if (filterRead === "pendientes" && a.read) return false;
    if (filterRead === "leidas" && !a.read) return false;
    return true;
  });

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
        <Button variant="outline" size="sm" onClick={markAllRead}>Marcar todas como leídas</Button>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const cfg = alertConfig[alert.type];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              className={`bg-card rounded-lg border shadow-sm p-4 flex gap-4 transition-all ${
                !alert.read ? "border-l-4 border-l-secondary" : "opacity-80"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.iconColor} bg-current/10`}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-sm font-semibold ${cfg.labelColor}`}>{alert.typeLabel}</span>
                    <p className="text-sm text-foreground">{alert.subtitle}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{alert.tramite}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate(alert.actionPath)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md ${cfg.btnColor}`}
                  >
                    {alert.actionLabel} &gt;
                  </button>
                  {!alert.read && (
                    <button onClick={() => markRead(alert.id)} className="text-xs text-muted-foreground hover:text-foreground">
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
