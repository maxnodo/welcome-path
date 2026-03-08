import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
