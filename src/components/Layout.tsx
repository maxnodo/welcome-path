import { ReactNode } from "react";
import { useLocation, useNavigate, Link, Navigate } from "react-router-dom";
import {
  Home, User, FileText, MessageSquare, Bell, CreditCard,
  Clock, HelpCircle, MessageCircle, Receipt, Calendar, LogOut, Phone, Mail,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Inicio", icon: Home, path: "/dashboard" },
  { label: "Mi Perfil", icon: User, path: "/perfil" },
  { label: "Mis Trámites", icon: FileText, path: "/tramites" },
  { label: "Mis Mensajes", icon: MessageSquare, path: "/mensajes", badge: 2 },
  { label: "Mis Alertas", icon: Bell, path: "/alertas", badge: 3 },
  { label: "Mi Suscripción", icon: CreditCard, path: "/suscripcion" },
  { label: "Mi Histórico", icon: Clock, path: "/historico" },
  { label: "Ayuda", icon: HelpCircle, path: "/ayuda" },
  { label: "Chat en Vivo", icon: MessageCircle, path: "/chat" },
  { label: "Mis Facturas", icon: Receipt, path: "/facturas" },
  { label: "Próximas Citas", icon: Calendar, path: "/citas" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Inicio",
  "/perfil": "Mi Perfil",
  "/tramites": "Mis Trámites",
  "/mensajes": "Mis Mensajes",
  "/alertas": "Mis Alertas",
  "/suscripcion": "Mi Suscripción",
  "/historico": "Mi Histórico",
  "/ayuda": "Ayuda",
  "/chat": "Chat en Vivo",
  "/facturas": "Mis Facturas",
  "/citas": "Próximas Citas",
};

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) ?? "";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <Logo size="md" light />
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2 text-xs text-sidebar-foreground/70">
          <Logo size="sm" light />
          <div className="flex items-center gap-2 mt-2">
            <Phone size={12} />
            <span>+34 900 123 456</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={12} />
            <span>contacto@welcome-ifa.com</span>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-2 mt-3 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-foreground">
            {pageTitles[pathname] ?? "Welcome"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <span className="text-sm text-foreground hidden md:block">
                Bienvenido, <span className="font-medium">{user?.name}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
