import { useState } from "react";
import { Users, Clock, Calendar, AlertTriangle, Eye, MessageSquare, UserPlus, Send, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const kpis = [
  { label: "Expedientes activos", value: 47, icon: Users, color: "text-secondary bg-secondary/10" },
  { label: "Pendientes revisión", value: 12, icon: Clock, color: "text-warning bg-warning/10" },
  { label: "Citas esta semana", value: 8, icon: Calendar, color: "text-primary bg-primary/10" },
  { label: "Alertas urgentes", value: 3, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
];

interface Expediente {
  id: string;
  cliente: string;
  tramite: string;
  status: string;
  gestor: string;
  email: string;
  nacionalidad: string;
  documento: string;
  expedienteNum: string;
}

const expedientes: Expediente[] = [
  { id: "1", cliente: "Carlos García", tramite: "Nacionalidad Española", status: "En revisión", gestor: "María López", email: "carlos.garcia@email.com", nacionalidad: "México", documento: "AB1234567", expedienteNum: "87596-NAC" },
  { id: "2", cliente: "Ana Martínez", tramite: "NIE", status: "Doc. incompleta", gestor: "Carlos Martínez", email: "ana.martinez@email.com", nacionalidad: "Colombia", documento: "CD9876543", expedienteNum: "8821-NIE" },
  { id: "3", cliente: "Miguel Torres", tramite: "Arraigo Social", status: "Presentado", gestor: "María López", email: "miguel.torres@email.com", nacionalidad: "Venezuela", documento: "EF5678901", expedienteNum: "4412-ARR" },
  { id: "4", cliente: "Lucía Fernández", tramite: "Renovación", status: "Aprobado", gestor: "Carlos Martínez", email: "lucia.f@email.com", nacionalidad: "Perú", documento: "GH2345678", expedienteNum: "5523-REN" },
  { id: "5", cliente: "Pedro Sánchez", tramite: "Reagrupación", status: "No iniciado", gestor: "Sin asignar", email: "pedro.s@email.com", nacionalidad: "Ecuador", documento: "IJ3456789", expedienteNum: "6634-REA" },
];

const alerts = [
  { color: "bg-destructive", client: "Carlos García", text: "Falta pasaporte", time: "Hace 20 min", action: "Resolver" },
  { color: "bg-warning", client: "Ana Martínez", text: "Cita mañana 10:00", time: "Ayer", action: "Ver" },
  { color: "bg-orange-500", client: "Miguel Torres", text: "Requerimiento oficial", time: "23 abril", action: "Atender" },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    "En revisión": "bg-secondary/10 text-secondary",
    "Doc. incompleta": "bg-warning/10 text-warning",
    "Presentado": "bg-purple-500/10 text-purple-600",
    "Aprobado": "bg-success/10 text-success",
    "No iniciado": "bg-muted text-muted-foreground",
  };
  return map[s] ?? "bg-muted text-muted-foreground";
};

const allStatuses = ["No iniciado", "Doc. incompleta", "En revisión", "Requerimiento", "Presentado", "Aprobado", "Finalizado"];
const gestores = ["María López", "Carlos Martínez", "Alejandro Torres"];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [selectedExp, setSelectedExp] = useState<Expediente | null>(null);
  const [detailStatus, setDetailStatus] = useState("");
  const [detailGestor, setDetailGestor] = useState("");
  const [notes, setNotes] = useState("");

  const openDetail = (exp: Expediente) => {
    setSelectedExp(exp);
    setDetailStatus(exp.status);
    setDetailGestor(exp.gestor);
    setNotes("");
  };

  const saveChanges = () => {
    toast({ title: "Cambios guardados", description: `Expediente ${selectedExp?.expedienteNum} actualizado.` });
    setSelectedExp(null);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card rounded-lg border shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expedientes table */}
        <div className="lg:col-span-2 bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground">Expedientes recientes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Trámite</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Gestor</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((exp) => (
                <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{exp.cliente}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.tramite}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(exp.status)}`}>{exp.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.gestor}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => openDetail(exp)}>
                        <Eye size={12} /> Ver
                      </Button>
                      {exp.gestor === "Sin asignar" ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <UserPlus size={12} /> Asignar
                        </Button>
                      ) : exp.status === "Doc. incompleta" ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <AlertTriangle size={12} /> Alerta
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <MessageSquare size={12} /> Mensaje
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-card rounded-lg border shadow-sm p-4 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Acciones rápidas</h3>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs"><UserPlus size={14} /> Nuevo expediente</Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs"><Send size={14} /> Enviar alerta masiva</Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs"><Calendar size={14} /> Ver agenda del día</Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-xs"><BarChart3 size={14} /> Generar informe</Button>
          </div>

          {/* Pending alerts */}
          <div className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Alertas pendientes</h3>
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${a.color} shrink-0 mt-1.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium text-xs">{a.client} — {a.text}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] shrink-0">{a.action}</Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedExp} onOpenChange={() => setSelectedExp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expediente {selectedExp?.expedienteNum}</DialogTitle>
          </DialogHeader>
          {selectedExp && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Datos del cliente</h4>
                  <p className="text-muted-foreground">Nombre: <span className="text-foreground">{selectedExp.cliente}</span></p>
                  <p className="text-muted-foreground">Documento: <span className="text-foreground">{selectedExp.documento}</span></p>
                  <p className="text-muted-foreground">Nacionalidad: <span className="text-foreground">{selectedExp.nacionalidad}</span></p>
                  <p className="text-muted-foreground">Email: <span className="text-foreground">{selectedExp.email}</span></p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Datos del trámite</h4>
                  <p className="text-muted-foreground">Tipo: <span className="text-foreground">{selectedExp.tramite}</span></p>
                  <p className="text-muted-foreground">Nº Expediente: <span className="text-foreground">{selectedExp.expedienteNum}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Gestor asignado</Label>
                  <Select value={detailGestor} onValueChange={setDetailGestor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {gestores.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Estado</Label>
                  <Select value={detailStatus} onValueChange={setDetailStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Notas internas (no visibles para el cliente)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añadir notas internas..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedExp(null)}>Cerrar</Button>
            <Button onClick={saveChanges}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
