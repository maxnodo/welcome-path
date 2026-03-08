import { useState, ReactNode } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  BarChart3, Users, ClipboardList, MessageSquare, Bell, Calendar,
  CreditCard, Settings, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const adminNavItems = [
  { label: "Dashboard", icon: BarChart3, path: "/admin" },
  { label: "Expedientes", icon: Users, path: "/admin/expedientes" },
  { label: "Trámites", icon: ClipboardList, path: "/admin/tramites" },
  { label: "Mensajes", icon: MessageSquare, path: "/admin/mensajes" },
  { label: "Alertas", icon: Bell, path: "/admin/alertas" },
  { label: "Citas", icon: Calendar, path: "/admin/citas" },
  { label: "Facturación", icon: CreditCard, path: "/admin/facturacion" },
  { label: "Configuración", icon: Settings, path: "/admin/configuracion" },
];

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForProfile, setWaitingForProfile] = useState(false);
  const { signIn, isGestor, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Once authenticated and profile loaded, redirect
  useEffect(() => {
    if (waitingForProfile && isAuthenticated && !authLoading) {
      if (isGestor) {
        navigate("/admin");
      } else {
        setError("No tienes permisos de gestor/admin.");
        setWaitingForProfile(false);
        setLoading(false);
      }
    }
  }, [waitingForProfile, isAuthenticated, authLoading, isGestor, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      setError("Credenciales incorrectas.");
    } else {
      setWaitingForProfile(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220_46%_12%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">WELCOME ADMIN</h1>
          <p className="text-sm text-white/50 mt-1">Panel de Gestión — Welcome IFA</p>
        </div>
        <div className="bg-card rounded-lg border shadow-lg p-8">
          <h2 className="text-lg font-semibold text-center mb-6 text-foreground">Acceso al panel</h2>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@welcome-ifa.com" required />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Accediendo..." : "Acceder como gestor"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[hsl(220_55%_12%)] text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-widest">WELCOME ADMIN</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {adminNavItems.map((item) => {
            const active = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/50">Conectado como</p>
          <p className="text-sm text-white font-medium">Admin — {profile?.full_name ?? "Gestor"}</p>
          <button
            onClick={async () => { await signOut(); navigate("/admin/login"); }}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white mt-2"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center px-6 shrink-0">
          <h1 className="text-base font-semibold text-foreground">
            {adminNavItems.find((n) => pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path)))?.label ?? "Dashboard"}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
};
