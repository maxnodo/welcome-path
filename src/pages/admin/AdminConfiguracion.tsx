import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Palette, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useToast } from "@/hooks/use-toast";

const SETTING_KEYS = {
  company_name: "company_name",
  contact_email: "contact_email",
  phone: "phone",
  cif: "cif",
  notify_status_changes: "notify_status_changes",
  notify_reminders: "notify_reminders",
  notify_expired_docs: "notify_expired_docs",
  two_factor: "two_factor",
  activity_log: "activity_log",
  dark_mode: "dark_mode",
};

const AdminConfiguracion = () => {
  const { profile } = useAuth();
  const { settings, loading, saveSettings } = useAppSettings();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      [SETTING_KEYS.company_name]: settings[SETTING_KEYS.company_name] ?? "WCE Welcome — Immigration & Foreign Affairs",
      [SETTING_KEYS.contact_email]: settings[SETTING_KEYS.contact_email] ?? "info@welcome-ifa.com",
      [SETTING_KEYS.phone]: settings[SETTING_KEYS.phone] ?? "+34 93 000 0000",
      [SETTING_KEYS.cif]: settings[SETTING_KEYS.cif] ?? "B12345678",
      [SETTING_KEYS.notify_status_changes]: settings[SETTING_KEYS.notify_status_changes] ?? "true",
      [SETTING_KEYS.notify_reminders]: settings[SETTING_KEYS.notify_reminders] ?? "true",
      [SETTING_KEYS.notify_expired_docs]: settings[SETTING_KEYS.notify_expired_docs] ?? "true",
      [SETTING_KEYS.two_factor]: settings[SETTING_KEYS.two_factor] ?? "false",
      [SETTING_KEYS.activity_log]: settings[SETTING_KEYS.activity_log] ?? "true",
      [SETTING_KEYS.dark_mode]: settings[SETTING_KEYS.dark_mode] ?? "false",
    });
  }, [settings]);

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleSwitch = (key: string) => updateField(key, form[key] === "true" ? "false" : "true");

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveSettings(form);
    setSaving(false);
    if (!error) {
      toast({ title: "Configuración guardada", description: "Los cambios se han aplicado correctamente." });
    } else {
      toast({ title: "Error al guardar", description: (error as any).message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={20} className="text-primary" />
          <h2 className="font-semibold text-foreground">Configuración del sistema</h2>
        </div>
        <p className="text-xs text-muted-foreground">Conectado como <span className="font-medium text-foreground">{profile?.full_name ?? "Gestor"}</span> ({profile?.role})</p>
      </div>

      {/* Datos de la empresa */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Datos de la empresa</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Nombre de la empresa</Label>
            <Input value={form[SETTING_KEYS.company_name] ?? ""} onChange={e => updateField(SETTING_KEYS.company_name, e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email de contacto</Label>
            <Input value={form[SETTING_KEYS.contact_email] ?? ""} onChange={e => updateField(SETTING_KEYS.contact_email, e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Teléfono</Label>
            <Input value={form[SETTING_KEYS.phone] ?? ""} onChange={e => updateField(SETTING_KEYS.phone, e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">CIF</Label>
            <Input value={form[SETTING_KEYS.cif] ?? ""} onChange={e => updateField(SETTING_KEYS.cif, e.target.value)} className="text-sm" />
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Notificaciones</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Emails automáticos al cliente</p>
              <p className="text-xs text-muted-foreground">Notificar cambios de estado de expedientes</p>
            </div>
            <Switch checked={form[SETTING_KEYS.notify_status_changes] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.notify_status_changes)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Recordatorios de citas</p>
              <p className="text-xs text-muted-foreground">Enviar recordatorio 24h antes</p>
            </div>
            <Switch checked={form[SETTING_KEYS.notify_reminders] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.notify_reminders)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Alertas de documentos vencidos</p>
              <p className="text-xs text-muted-foreground">Avisar cuando un permiso esté próximo a vencer</p>
            </div>
            <Switch checked={form[SETTING_KEYS.notify_expired_docs] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.notify_expired_docs)} />
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Seguridad</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Autenticación en dos pasos</p>
              <p className="text-xs text-muted-foreground">Requerir 2FA para gestores</p>
            </div>
            <Switch checked={form[SETTING_KEYS.two_factor] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.two_factor)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Registro de actividad</p>
              <p className="text-xs text-muted-foreground">Log de acciones de gestores</p>
            </div>
            <Switch checked={form[SETTING_KEYS.activity_log] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.activity_log)} />
          </div>
        </div>
      </div>

      {/* Apariencia */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Apariencia</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Modo oscuro</p>
            <p className="text-xs text-muted-foreground">Tema del panel de administración</p>
          </div>
          <Switch checked={form[SETTING_KEYS.dark_mode] === "true"} onCheckedChange={() => toggleSwitch(SETTING_KEYS.dark_mode)} />
        </div>
      </div>

      {/* Base de datos */}
      <div className="bg-card rounded-lg border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Base de datos</h3>
        </div>
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
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  );
};

export default AdminConfiguracion;
