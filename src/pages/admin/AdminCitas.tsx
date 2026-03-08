import { useState } from "react";
import { Calendar, Clock, Phone, Video, Users, MapPin, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminCitas } from "@/hooks/useAdminCitas";
import { useToast } from "@/hooks/use-toast";
import { Cita } from "@/types/database.types";

const typeIcons: Record<string, typeof Phone> = {
  llamada_telefonica: Phone,
  videollamada: Video,
  reunion_extendida: Users,
  presencial: MapPin,
};

const typeLabels: Record<string, string> = {
  llamada_telefonica: "Llamada",
  videollamada: "Videollamada",
  reunion_extendida: "Reunión extendida",
  presencial: "Presencial",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  reprogramada: "Reprogramada",
};

const statusColor: Record<string, string> = {
  pendiente: "bg-warning/10 text-warning",
  confirmada: "bg-success/10 text-success",
  completada: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive/10 text-destructive",
  reprogramada: "bg-secondary/10 text-secondary",
};

const AdminCitas = () => {
  const { toast } = useToast();
  const { citas, loading, updateCita } = useAdminCitas();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = citas.filter((c) => {
    const user = (c as any).user;
    const matchSearch = !search ||
      (user?.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const today = new Date().toDateString();
  const todayCitas = citas.filter(c => new Date(c.scheduled_at).toDateString() === today && c.status !== "cancelada");
  const upcoming = citas.filter(c => new Date(c.scheduled_at) > new Date() && c.status !== "cancelada");

  const handleStatusChange = async (cita: Cita, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "cancelada") updates.cancelled_at = new Date().toISOString();
    const { error } = await updateCita(cita.id, updates);
    if (!error) toast({ title: "Cita actualizada" });
    else toast({ title: "Error", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Calendar size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Hoy</p>
            <p className="text-2xl font-bold text-foreground">{todayCitas.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center"><Clock size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Próximas</p>
            <p className="text-2xl font-bold text-foreground">{upcoming.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center"><Users size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{citas.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><Filter size={14} className="mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Fecha y hora</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Duración</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No hay citas.</td></tr>
            ) : filtered.map((cita) => {
              const TypeIcon = typeIcons[cita.type] ?? Calendar;
              const user = (cita as any).user;
              return (
                <tr key={cita.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon size={16} className="text-muted-foreground" />
                      <span className="text-foreground text-xs">{typeLabels[cita.type] ?? cita.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground text-sm">{user?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground text-xs">
                    {new Date(cita.scheduled_at).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{cita.duration_minutes} min</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[cita.status] ?? ""}`}>
                      {statusLabels[cita.status] ?? cita.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={cita.status} onValueChange={(v) => handleStatusChange(cita, v)}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCitas;
