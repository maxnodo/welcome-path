import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { AdminLayout, AdminLogin } from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Preinscripcion from "@/pages/Preinscripcion";
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
import AdminPreinscritos from "@/pages/admin/AdminPreinscritos";
import NotFound from "@/pages/NotFound";
import Logo from "@/components/Logo";

const queryClient = new QueryClient();


const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-4">
        <Logo size="lg" />
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

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
            <Route path="/preinscripcion" element={<Preinscripcion />} />

            {/* User area */}
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Layout><Perfil /></Layout></PrivateRoute>} />
            <Route path="/tramites" element={<PrivateRoute><Layout><Tramites /></Layout></PrivateRoute>} />
            <Route path="/mensajes" element={<PrivateRoute><Layout><Mensajes /></Layout></PrivateRoute>} />
            <Route path="/alertas" element={<PrivateRoute><Layout><Alertas /></Layout></PrivateRoute>} />
            <Route path="/suscripcion" element={<PrivateRoute><Layout><Suscripcion /></Layout></PrivateRoute>} />
            <Route path="/historico" element={<PrivateRoute><Layout><Historico /></Layout></PrivateRoute>} />
            <Route path="/ayuda" element={<PrivateRoute><Layout><Ayuda /></Layout></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Layout><Chat /></Layout></PrivateRoute>} />
            <Route path="/facturas" element={<PrivateRoute><Layout><Facturas /></Layout></PrivateRoute>} />
            <Route path="/citas" element={<PrivateRoute><Layout><Citas /></Layout></PrivateRoute>} />

            {/* Admin area */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/expedientes" element={<AdminRoute><AdminLayout><AdminExpedientes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/tramites" element={<AdminRoute><AdminLayout><AdminExpedientes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/mensajes" element={<AdminRoute><AdminLayout><AdminMensajes /></AdminLayout></AdminRoute>} />
            <Route path="/admin/alertas" element={<AdminRoute><AdminLayout><AdminAlertas /></AdminLayout></AdminRoute>} />
            <Route path="/admin/citas" element={<AdminRoute><AdminLayout><AdminCitas /></AdminLayout></AdminRoute>} />
            <Route path="/admin/facturacion" element={<AdminRoute><AdminLayout><AdminFacturacion /></AdminLayout></AdminRoute>} />
            <Route path="/admin/preinscritos" element={<AdminRoute><AdminLayout><AdminPreinscritos /></AdminLayout></AdminRoute>} />
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
