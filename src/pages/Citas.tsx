import { useState } from "react";
import { Phone, Video, Users, Clock, User, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const appointmentTypes = [
  { id: "llamada", label: "Llamada telefónica", icon: Phone, included: true, desc: "Incluida en tu suscripción mensual" },
  { id: "video", label: "Videollamada", icon: Video, included: true, desc: "Incluida en tu suscripción mensual" },
  { id: "reunion", label: "Reunión extendida", icon: Users, included: false, desc: "30 minutos. Servicio adicional.", extra: "Consulta detalles y costes con tu gestor." },
];

const fullDays = [5, 6, 13, 19, 20, 26, 27];
const availableDays = [1, 3, 4, 7, 8, 11, 12, 14, 15, 18, 21, 22, 25, 28];
const timeSlots = ["10:00", "10:30", "11:00", "11:30", "16:00"];
const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// June 2024 starts on Saturday (index 5)
const startOffset = 5;
const totalDays = 30;

interface Appointment {
  id: string;
  type: string;
  typeLabel: string;
  date: string;
  time: string;
  gestor: string;
  confirmed: boolean;
}

const Citas = () => {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["llamada", "video", "reunion"]);
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedTime, setSelectedTime] = useState("11:00");
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", type: "llamada", typeLabel: "Llamada telefónica", date: "Martes, 12 de junio", time: "11:00", gestor: "Alejandro Torres", confirmed: true },
  ]);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const confirmAppointment = () => {
    const newAppt: Appointment = {
      id: `a${Date.now()}`,
      type: selectedTypes[0] || "llamada",
      typeLabel: appointmentTypes.find((t) => t.id === (selectedTypes[0] || "llamada"))?.label || "Cita",
      date: `12 de junio`,
      time: selectedTime,
      gestor: "Alejandro Torres",
      confirmed: true,
    };
    setAppointments((prev) => [...prev, newAppt]);
    toast({ title: "Cita confirmada", description: `Para el 12 de junio a las ${selectedTime}` });
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setCancelDialog(null);
    toast({ title: "Cita cancelada" });
  };

  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= totalDays; d++) calendarCells.push(d);

  return (
    <div className="max-w-5xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Reserva aquí una cita con tu gestor asignado para seguimiento de tu trámite o revisión de documentación.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel */}
        <div className="lg:w-[420px] space-y-6 shrink-0">
          {/* Type selector */}
          <div className="bg-card rounded-lg border shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Selección de citas</h3>
            {appointmentTypes.map((t) => {
              const Icon = t.icon;
              return (
                <label
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTypes.includes(t.id) ? "border-secondary bg-secondary/5" : "border-border"
                  }`}
                >
                  <Checkbox checked={selectedTypes.includes(t.id)} onCheckedChange={() => toggleType(t.id)} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{t.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">● {t.desc}</p>
                    {t.extra && <p className="text-xs text-muted-foreground">{t.extra}</p>}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <button className="text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
              <span className="text-sm font-semibold text-foreground">Junio 2024</span>
              <button className="text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((d) => (
                <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {calendarCells.map((day, i) => {
                if (day === null) return <div key={`e${i}`} />;
                const isSelected = day === selectedDay;
                const isFull = fullDays.includes(day);
                const isAvailable = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => isAvailable && setSelectedDay(day)}
                    disabled={isFull || !isAvailable}
                    className={`w-9 h-9 rounded-full text-xs font-medium transition-colors mx-auto flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isFull
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : isAvailable
                        ? "hover:bg-secondary/10 text-foreground"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-card border border-border" /> Disponible</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted" /> Completo</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Seleccionado</span>
            </div>

            {/* Time slots */}
            <div className="pt-3 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Horarios disponibles — {selectedDay} junio</p>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTime === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 space-y-6">
          {/* Booking confirmation */}
          <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
            <p className="text-xs text-muted-foreground font-medium">Has seleccionado:</p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone size={16} className="text-primary" />
                <span className="font-medium">Llamada telefónica</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>{selectedTime} - {selectedTime === "16:00" ? "16:15" : `${selectedTime.split(":")[0]}:${String(Number(selectedTime.split(":")[1]) + 15).padStart(2, "0")}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={14} />
                <span>Gestor asignado: Alejandro Torres</span>
              </div>
            </div>
            <Button className="w-full" onClick={confirmAppointment}>Confirmar cita</Button>
          </div>

          {/* Existing appointments */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tus próximas citas</h3>
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone size={14} className="text-primary" />
                      {appt.typeLabel}
                    </div>
                    <p className="text-sm text-muted-foreground">{appt.date} — {appt.time}</p>
                    <p className="text-xs text-muted-foreground">Gestor: {appt.gestor}</p>
                  </div>
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">Reprogramar</Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setCancelDialog(appt.id)}>Cancelar</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => toast({ title: "Función disponible próximamente" })}
                  >
                    Añadir al calendario
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer notes */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          La llamada mensual de 15 minutos está incluida en tu suscripción activa. Es necesario mantener los pagos al día para poder reservar nuevas citas.
        </p>
        <p className="text-xs text-muted-foreground">
          Las citas deben cancelarse con al menos 24 horas de antelación. En caso contrario, se considerará utilizada la llamada mensual incluida.
        </p>
      </div>

      {/* Cancel dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancelar cita</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">¿Estás seguro de que deseas cancelar esta cita?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)}>No, mantener</Button>
            <Button variant="destructive" onClick={() => cancelDialog && cancelAppointment(cancelDialog)}>Sí, cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Citas;
