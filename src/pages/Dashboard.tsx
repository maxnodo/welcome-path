import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useMensajes } from "@/hooks/useMensajes";
import { useAlertas } from "@/hooks/useAlertas";
import { useCitas } from "@/hooks/useCitas";
import { useFacturas } from "@/hooks/useFacturas";
import {
  User, FileText, Mail, Bell, CreditCard, Clock,
  HelpCircle, MessageCircle, Receipt, Calendar,
} from "lucide-react";

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { expedientes } = useExpedientes();
  const { unreadCount: mensajesUnread } = useMensajes();
  const { unreadCount: alertasUnread } = useAlertas();
  const { citas } = useCitas();
  const { pendingCount: facturasPending } = useFacturas();

  const displayName = profile?.full_name ?? "Usuario";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const dashboardCards = [
    { title: "Mi perfil", icon: User, path: "/perfil", count: undefined },
    { title: "Mis trámites / Mis documentos", icon: FileText, path: "/tramites", count: expedientes.length },
    { title: "Mis mensajes", icon: Mail, path: "/mensajes", count: mensajesUnread },
    { title: "Mis Alertas", icon: Bell, path: "/alertas", count: alertasUnread, badgeColor: "destructive" },
    { title: "Mi suscripción", icon: CreditCard, path: "/suscripcion", count: undefined },
    { title: "Mi histórico", icon: Clock, path: "/historico", count: undefined },
    { title: "Ayuda", icon: HelpCircle, path: "/ayuda" },
    { title: "Chat en vivo", icon: MessageCircle, path: "/chat", online: true },
    { title: "Mis facturas", icon: Receipt, path: "/facturas", count: facturasPending },
    { title: "Próximas citas", icon: Calendar, path: "/citas", count: citas.length },
  ];

  return (
    <div className="flex gap-6">
      {/* Left column - user card */}
      <div className="w-64 shrink-0 hidden lg:block">
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {initials}
          </div>
          <p className="text-sm text-muted-foreground">Bienvenido</p>
          <p className="font-semibold text-foreground text-lg">{displayName}</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>Nacionalidad: {profile?.nationality ?? "—"}</p>
            <p className="break-all">{profile?.email ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Right column - cards grid */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardCards.map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="bg-card rounded-lg border shadow-sm p-5 text-left hover:shadow-md hover:border-secondary/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <card.icon size={24} className="text-primary" />
                {card.online ? (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <span className="w-2 h-2 bg-success rounded-full" />
                    En línea
                  </span>
                ) : card.count !== undefined ? (
                  <span className={`text-2xl font-bold ${card.badgeColor === "destructive" ? "text-destructive" : "text-foreground"}`}>
                    {card.count}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-medium text-foreground group-hover:text-secondary transition-colors">
                {card.title}
              </p>
            </button>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-secondary" />
            <p className="text-sm text-foreground">
              Contacta con tu asesor para confirmar tus datos.
            </p>
          </div>
          <button
            onClick={() => navigate("/mensajes")}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors shrink-0"
          >
            Contactar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
