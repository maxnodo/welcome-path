import { useState } from "react";
import { Check, AlertTriangle, CreditCard, Building, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSuscripcion } from "@/hooks/useSuscripcion";

const features = [
  "Gestión activa y seguimiento continuo de tu trámite migratorio.",
  "Asesoramiento personalizado durante todo el proceso.",
  "Revisión y validación de documentación antes de su presentación.",
  "Comunicación directa con tu gestor asignado.",
  "1 llamada mensual de 15 minutos con tu asesor para revisión de estado, resolución de dudas y planificación.",
];

const paymentMethods = [
  { id: "bizum", label: "Bizum", icon: Smartphone },
  { id: "tarjeta", label: "Tarjeta — Visa, MasterCard, AMEX", icon: CreditCard },
  { id: "transferencia", label: "Transferencia", icon: Building },
];

const Suscripcion = () => {
  const { suscripcion, isActive, loading } = useSuscripcion();
  const [method, setMethod] = useState("tarjeta");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Aquí puedes gestionar tu suscripción mensual para la tramitación activa de tus documentos migratorios en España. Mantén tus pagos al día para asegurar la continuidad del servicio.
      </p>

      {/* Status indicator */}
      {!loading && suscripcion && (
        <div className={`flex items-center gap-2 text-sm font-medium ${isActive ? "text-success" : "text-warning"}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-success" : "bg-warning"}`} />
          {isActive ? "Suscripción activa" : `Estado: ${suscripcion.status}`}
          {suscripcion.next_billing_date && (
            <span className="text-xs text-muted-foreground ml-2">
              Próxima facturación: {new Date(suscripcion.next_billing_date).toLocaleDateString("es-ES")}
            </span>
          )}
        </div>
      )}

      {/* Plan card */}
      <div className="bg-card rounded-lg border shadow-sm border-l-4 border-l-primary p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tarifa Mensual</h3>
          <p className="text-3xl font-bold text-primary mt-1">
            {suscripcion ? `${suscripcion.amount.toFixed(2).replace('.', ',')}€` : "69,95€"}
            <span className="text-base font-normal text-muted-foreground">/mes</span>
          </p>
        </div>
        <ul className="space-y-2.5">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check size={16} className="text-success shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          La suscripción se renueva automáticamente cada año y puedes cancelarla en cualquier momento.
        </p>
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
          <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">Es necesario mantener los pagos al día para garantizar la entrega de tu resolución final.</p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Método de pago</label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((pm) => {
            const Icon = pm.icon;
            return (
              <button
                key={pm.id}
                onClick={() => setMethod(pm.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all ${
                  method === pm.id ? "border-secondary bg-secondary/5 ring-1 ring-secondary" : "border-border hover:border-secondary/40"
                }`}
              >
                <Icon size={24} className={method === pm.id ? "text-secondary" : "text-muted-foreground"} />
                <span className="text-xs font-medium text-foreground">{pm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <Button size="lg" onClick={() => setShowModal(true)}>
          {isActive ? "Gestionar suscripción" : "Suscribirse ahora"}
        </Button>
        <button className="text-sm text-muted-foreground hover:text-foreground">Cancelar suscripción</button>
      </div>

      {/* Info blocks */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          Recuerda que este pago mensual incluye no solo nuestro asesoramiento experto, sino también la gestión activa y profesional de tus trámites ante las autoridades españolas.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Puedes cancelar tu suscripción en cualquier momento desde esta sección. La suscripción se renovará automáticamente pasado el año, salvo cancelación previa.
      </p>

      {/* Footer alert */}
      <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-md p-3">
        <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">Mantén tus pagos al día para asegurar la entrega final de tus documentos.</p>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Integración de pago</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Integración de pago próximamente disponible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suscripcion;
