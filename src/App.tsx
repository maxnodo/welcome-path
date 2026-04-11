import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { AdminLayout, AdminLogin } from "@/components/AdminLayout";
import Logo from "@/components/Logo";

// Lazy-loaded pages
const Login = lazy(() => import("@/pages/Login"));
const Preinscripcion = lazy(() => import("@/pages/Preinscripcion"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Perfil = lazy(() => import("@/pages/Perfil"));
const Tramites = lazy(() => import("@/pages/Tramites"));
const Mensajes = lazy(() => import("@/pages/Mensajes"));
const Alertas = lazy(() => import("@/pages/Alertas"));
const Suscripcion = lazy(() => import("@/pages/Suscripcion"));
const Historico = lazy(() => import("@/pages/Historico"));
const Ayuda = lazy(() => import("@/pages/Ayuda"));
const Chat = lazy(() => import("@/pages/Chat"));
const Facturas = lazy(() => import("@/pages/Facturas"));
const Citas = lazy(() => import("@/pages/Citas"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminExpedientes = lazy(() => import("@/pages/admin/AdminExpedientes"));
const AdminMensajes = lazy(() => import("@/pages/admin/AdminMensajes"));
const AdminAlertas = lazy(() => import("@/pages/admin/AdminAlertas"));
const AdminCitas = lazy(() => import("@/pages/admin/AdminCitas"));
const AdminFacturacion = lazy(() => import("@/pages/admin/AdminFacturacion"));
const AdminConfiguracion = lazy(() => import("@/pages/admin/AdminConfiguracion"));
const AdminPreinscritos = lazy(() => import("@/pages/admin/AdminPreinscritos"));
const AdminUsuarios = lazy(() => import("@/pages/admin/AdminUsuarios"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="text-center space-y-4">
      <Logo size="lg" />
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
    </div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isGestor, loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isGestor) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isGestor, loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isGestor) return <Navigate to="/dashboard" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isGestor, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
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
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/admin/mensajes" element={<AdminRoute><AdminLayout><AdminMensajes /></AdminLayout></AdminRoute>} />
              <Route path="/admin/alertas" element={<AdminRoute><AdminLayout><AdminAlertas /></AdminLayout></AdminRoute>} />
              <Route path="/admin/citas" element={<AdminRoute><AdminLayout><AdminCitas /></AdminLayout></AdminRoute>} />
              <Route path="/admin/facturacion" element={<AdminRoute><AdminLayout><AdminFacturacion /></AdminLayout></AdminRoute>} />
              <Route path="/admin/preinscritos" element={<AdminRoute><AdminLayout><AdminPreinscritos /></AdminLayout></AdminRoute>} />
              <Route path="/admin/configuracion" element={<AdminOnlyRoute><AdminLayout><AdminConfiguracion /></AdminLayout></AdminOnlyRoute>} />
              <Route path="/admin/usuarios" element={<AdminOnlyRoute><AdminLayout><AdminUsuarios /></AdminLayout></AdminOnlyRoute>} />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
