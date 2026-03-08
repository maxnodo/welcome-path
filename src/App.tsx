import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { AdminLayout, AdminLogin } from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Perfil from "@/pages/Perfil";
import Tramites from "@/pages/Tramites";
import Mensajes from "@/pages/Mensajes";
import Alertas from "@/pages/Alertas";
import Suscripcion from "@/pages/Suscripcion";
import Historico from "@/pages/Historico";
import Ayuda from "@/pages/Ayuda";
import Chat from "@/pages/Chat";
import Facturas from "@/pages/Facturas";
import Citas from "@/pages/Citas";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminExpedientes from "@/pages/admin/AdminExpedientes";
import AdminMensajes from "@/pages/admin/AdminMensajes";
import AdminAlertas from "@/pages/admin/AdminAlertas";
import AdminCitas from "@/pages/admin/AdminCitas";
import AdminFacturacion from "@/pages/admin/AdminFacturacion";
import AdminConfiguracion from "@/pages/admin/AdminConfiguracion";
import NotFound from "@/pages/NotFound";
import Logo from "@/components/Logo";

const queryClient = new QueryClient();

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">Sección en construcción</p>
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isGestor, loading, isAuthenticated } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-4">
        <Logo size="lg" />
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isGestor) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGestor, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-4">
        <Logo size="lg" />
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
  if (isAuthenticated && isGestor) return <Navigate to="/admin" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

            {/* User area */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
            <Route path="/tramites" element={<Layout><Tramites /></Layout>} />
            <Route path="/mensajes" element={<Layout><Mensajes /></Layout>} />
            <Route path="/alertas" element={<Layout><Alertas /></Layout>} />
            <Route path="/suscripcion" element={<Layout><Suscripcion /></Layout>} />
            <Route path="/historico" element={<Layout><Historico /></Layout>} />
            <Route path="/ayuda" element={<Layout><Ayuda /></Layout>} />
            <Route path="/chat" element={<Layout><Chat /></Layout>} />
            <Route path="/facturas" element={<Layout><Facturas /></Layout>} />
            <Route path="/citas" element={<Layout><Citas /></Layout>} />

            {/* Admin area */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/expedientes" element={<AdminRoute><AdminLayout><AdminExpedientes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/tramites" element={<AdminRoute><AdminLayout><AdminExpedientes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/mensajes" element={<AdminRoute><AdminLayout><AdminMensajes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/alertas" element={<AdminRoute><AdminLayout><AdminAlertas /></AdminLayout></AdminRoute>} />
            <Route path="/admin/citas" element={<AdminRoute><AdminLayout><AdminCitas /></AdminLayout></AdminRoute>} />
            <Route path="/admin/facturacion" element={<AdminRoute><AdminLayout><AdminFacturacion /></AdminLayout></AdminRoute>} />
            <Route path="/admin/configuracion" element={<AdminRoute><AdminLayout><AdminConfiguracion /></AdminLayout></AdminRoute>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
