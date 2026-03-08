import { Settings, Shield, Bell, Palette, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const AdminConfiguracion = () => {
  const { profile } = useAuth();

  const sections = [
    {
      title: "Datos de la empresa",
      icon: Globe,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Nombre de la empresa</Label>
            <Input defaultValue="WCE Welcome — Immigration & Foreign Affairs" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email de contacto</Label>
            <Input defaultValue="info@welcome-ifa.com" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Teléfono</Label>
            <Input defaultValue="+34 93 000 0000" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">CIF</Label>
            <Input defaultValue="B12345678" className="text-sm" />
          </div>
        </div>
      ),
    },
    {
      title: "Notificaciones",
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Emails automáticos al cliente</p>
              <p className="text-xs text-muted-foreground">Notificar cambios de estado de expedientes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Recordatorios de citas</p>
              <p className="text-xs text-muted-foreground">Enviar recordatorio 24h antes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Alertas de documentos vencidos</p>
              <p className="text-xs text-muted-foreground">Avisar cuando un permiso esté próximo a vencer</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      ),
    },
    {
      title: "Seguridad",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Autenticación en dos pasos</p>
              <p className="text-xs text-muted-foreground">Requerir 2FA para gestores</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Registro de actividad</p>
              <p className="text-xs text-muted-foreground">Log de acciones de gestores</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      ),
    },
    {
      title: "Apariencia",
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Modo oscuro</p>
              <p className="text-xs text-muted-foreground">Tema del panel de administración</p>
            </div>
            <Switch />
          </div>
        </div>
      ),
    },
    {
      title: "Base de datos",
      icon: Database,
      content: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Estado</span>
            <span className="text-success font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 bg-success rounded-full" /> Conectada
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Proveedor</span>
            <span className="text-foreground">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Región</span>
            <span className="text-foreground">eu-west-1</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={20} className="text-primary" />
          <h2 className="font-semibold text-foreground">Configuración del sistema</h2>
        </div>
        <p className="text-xs text-muted-foreground">Conectado como <span className="font-medium text-foreground">{profile?.full_name ?? "Gestor"}</span> ({profile?.role})</p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="bg-card rounded-lg border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-primary" />
              <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
            </div>
            {section.content}
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button>Guardar configuración</Button>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
