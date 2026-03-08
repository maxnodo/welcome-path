import { useState } from "react";
import { Bell, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAlertas } from "@/hooks/useAdminAlertas";
import { useToast } from "@/hooks/use-toast";
import { AlertaType } from "@/types/database.types";

const typeLabels: Record<AlertaType, string> = {
  urgente: "Urgente",
  recordatorio: "Recordatorio",
  presentacion_pendiente: "Presentación pendiente",
  resolucion: "Resolución",
};

const typeColor: Record<string, string> = {
  urgente: "bg-destructive/10 text-destructive",
  recordatorio: "bg-warning/10 text-warning",
  presentacion_pendiente: "bg-orange-500/10 text-orange-600",
  resolucion: "bg-success/10 text-success",
};

const AdminAlertas = () => {
  const { toast } = useToast();
  const { alertas, loading, deleteAlerta } = useAdminAlertas();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

  const filtered = alertas.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    const matchRead = filterRead === "all" || (filterRead === "unread" ? !a.is_read : a.is_read);
    return matchSearch && matchType && matchRead;
  });

  const handleDelete = async (id: string) => {
    const { error } = await deleteAlerta(id);
    if (!error) toast({ title: "Alerta eliminada" });
    else toast({ title: "Error", variant: "destructive" });
  };

  const stats = {
    total: alertas.length,
    unread: alertas.filter(a => !a.is_read).length,
    urgente: alertas.filter(a => a.type === "urgente" && !a.is_read).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Total alertas</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">No leídas</p>
          <p className="text-2xl font-bold text-warning">{stats.unread}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Urgentes sin leer</p>
          <p className="text-2xl font-bold text-destructive">{stats.urgente}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar alerta..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><Filter size={14} className="mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {(Object.keys(typeLabels) as AlertaType[]).map(t => (
              <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRead} onValueChange={setFilterRead}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">No leídas</SelectItem>
            <SelectItem value="read">Leídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="bg-card rounded-lg border shadow-sm divide-y">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground text-sm">Cargando alertas...</p>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay alertas.</p>
          </div>
        ) : filtered.map((a) => (
          <div key={a.id} className={`flex items-start gap-4 px-5 py-4 ${!a.is_read ? "bg-primary/[0.02]" : ""}`}>
            <span className={`shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${
              a.type === 'urgente' ? 'bg-destructive' : a.type === 'recordatorio' ? 'bg-warning' : a.type === 'resolucion' ? 'bg-success' : 'bg-orange-500'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground">{a.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColor[a.type] ?? ""}`}>
                  {typeLabels[a.type] ?? a.type}
                </span>
                {!a.is_read && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Nueva</span>}
              </div>
              {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span>{new Date(a.created_at).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                {(a as any).user?.full_name && <span>→ {(a as any).user.full_name}</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(a.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAlertas;
