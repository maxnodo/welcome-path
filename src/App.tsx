import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">Sección en construcción</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

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
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/expedientes" element={<AdminLayout><AdminPlaceholder title="Expedientes" /></AdminLayout>} />
            <Route path="/admin/tramites" element={<AdminLayout><AdminPlaceholder title="Trámites" /></AdminLayout>} />
            <Route path="/admin/mensajes" element={<AdminLayout><AdminPlaceholder title="Mensajes" /></AdminLayout>} />
            <Route path="/admin/alertas" element={<AdminLayout><AdminPlaceholder title="Alertas" /></AdminLayout>} />
            <Route path="/admin/citas" element={<AdminLayout><AdminPlaceholder title="Citas" /></AdminLayout>} />
            <Route path="/admin/facturacion" element={<AdminLayout><AdminPlaceholder title="Facturación" /></AdminLayout>} />
            <Route path="/admin/configuracion" element={<AdminLayout><AdminPlaceholder title="Configuración" /></AdminLayout>} />

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
