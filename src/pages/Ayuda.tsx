import { useNavigate } from "react-router-dom";
import { FolderOpen, CreditCard, FileText, Settings, Download, ExternalLink, MessageSquare, Phone, MessageCircle, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FaqBlock {
  title: string;
  icon: typeof FolderOpen;
  items: { q: string; a: string }[];
}

const faqLeft: FaqBlock[] = [
  {
    title: "Sobre mis trámites",
    icon: FolderOpen,
    items: [
      { q: "¿Cuánto tiempo tarda la resolución de mi expediente?", a: "Los tiempos varían según el tipo de trámite y la administración competente. El NIE puede resolverse en 1-3 semanas, mientras que la Nacionalidad Española puede tardar entre 1 y 3 años." },
      { q: "¿Cómo sé si mi documentación fue validada?", a: "Recibirás una alerta en la sección 'Mis Alertas' y un mensaje de tu gestor cuando la documentación haya sido revisada y validada." },
      { q: "¿Qué significa estado 'En revisión'?", a: "Significa que tu gestor está verificando la documentación enviada antes de presentarla ante las autoridades." },
      { q: "¿Qué ocurre si recibo un requerimiento?", a: "Recibirás una alerta urgente. Debes acceder a 'Mis Alertas' y seguir las instrucciones de tu gestor para subsanar el requerimiento en el plazo indicado." },
    ],
  },
  {
    title: "Sobre pagos y suscripción",
    icon: CreditCard,
    items: [
      { q: "¿Qué incluye la suscripción mensual?", a: "Incluye gestión activa de tu trámite, asesoramiento personalizado, revisión documental, comunicación directa con tu gestor y 1 llamada mensual de 15 minutos." },
      { q: "¿Puedo cancelar en cualquier momento?", a: "Sí. Puedes cancelar desde la sección 'Mi Suscripción'. El servicio continuará hasta el final del periodo ya abonado." },
      { q: "¿Qué ocurre si tengo un pago pendiente?", a: "El servicio puede verse limitado. No podremos presentar ni entregar documentación final hasta regularizar el pago." },
      { q: "¿Cómo descargo mis facturas?", a: "Accede a 'Mis Facturas' en el menú lateral. Allí encontrarás todas tus facturas disponibles para descarga en PDF." },
    ],
  },
];

const faqRight: FaqBlock[] = [
  {
    title: "Sobre documentación",
    icon: FileText,
    items: [
      { q: "¿En qué formato debo subir los documentos?", a: "Aceptamos archivos en formato PDF o JPG. El tamaño máximo por archivo es de 5 MB." },
      { q: "¿Puedo modificar un documento ya enviado?", a: "Contacta con tu gestor a través de 'Mis Mensajes'. En algunos casos es posible sustituir un documento antes de la presentación." },
      { q: "¿Qué sucede si subo un archivo incorrecto?", a: "Tu gestor lo detectará durante la revisión y te notificará a través de 'Mis Alertas' para que lo corrijas." },
      { q: "¿Cómo sé si mi documento fue aceptado?", a: "Recibirás una alerta verde de confirmación y podrás ver el estado 'Validado' en la sección 'Mi Histórico > Documentación'." },
    ],
  },
  {
    title: "Sobre la plataforma",
    icon: Settings,
    items: [
      { q: "¿Cómo cambio mis datos personales?", a: "Accede a 'Mi Perfil' en el menú lateral, modifica los datos necesarios y pulsa 'Guardar'." },
      { q: "¿Cómo contacto con mi gestor?", a: "A través de 'Mis Mensajes' para comunicación formal, o 'Chat en Vivo' para consultas rápidas." },
      { q: "¿Cómo programo mi llamada mensual?", a: "Accede a 'Próximas Citas' y selecciona 'Llamada telefónica'. Elige fecha y hora disponible y confirma." },
      { q: "¿Qué hago si no puedo acceder a mi cuenta?", a: "Usa la opción 'Olvidé mi contraseña' en la pantalla de login, o contacta con soporte a través del botón inferior." },
    ],
  },
];

const guides = [
  { label: "Guía paso a paso para solicitar NIE", action: "Descargar" },
  { label: "Guía para solicitar Nacionalidad Española", action: "Descargar" },
  { label: "Checklist general de documentación", action: "Descargar" },
  { label: "Enlaces oficiales del Ministerio de Justicia", action: "Ver" },
  { label: "Calendario de citas oficiales", action: "Ver" },
];

const FaqSection = ({ block, prefix }: { block: FaqBlock; prefix: string }) => {
  const Icon = block.icon;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-secondary" />
        <h3 className="text-sm font-semibold text-foreground">{block.title}</h3>
      </div>
      <Accordion type="single" collapsible>
        {block.items.map((item, i) => (
          <AccordionItem key={i} value={`${prefix}-${i}`}>
            <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const Ayuda = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl space-y-8">
      <p className="text-sm text-muted-foreground">
        Encuentra aquí respuestas a las preguntas más frecuentes sobre tus trámites, el funcionamiento de la plataforma y los requisitos necesarios para cada procedimiento.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left */}
        <div className="space-y-8">
          {faqLeft.map((block, i) => (
            <div key={i} className="bg-card rounded-lg border shadow-sm p-5">
              <FaqSection block={block} prefix={`l${i}`} />
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="space-y-8">
          {faqRight.map((block, i) => (
            <div key={i} className="bg-card rounded-lg border shadow-sm p-5">
              <FaqSection block={block} prefix={`r${i}`} />
            </div>
          ))}

          {/* Support contact */}
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-primary p-4">
              <h3 className="text-sm font-semibold text-primary-foreground">Contacto con Soporte</h3>
            </div>
            <div className="p-5 space-y-4">
              <Button className="w-full">Contactar con soporte</Button>
              <p className="text-xs text-muted-foreground">
                Si no encuentras la respuesta a tu consulta, puedes contactar directamente con nuestro equipo de soporte. Te responderemos en el menor tiempo posible.
              </p>
              <div className="space-y-2">
                <button onClick={() => navigate("/mensajes")} className="flex items-center gap-2 text-sm text-foreground hover:text-secondary w-full">
                  <MessageSquare size={16} className="text-secondary" /> Enviar mensaje
                </button>
                <button onClick={() => navigate("/citas")} className="flex items-center gap-2 text-sm text-foreground hover:text-secondary w-full">
                  <Phone size={16} className="text-secondary" /> Solicitar llamada
                </button>
                <button onClick={() => navigate("/chat")} className="flex items-center gap-2 text-sm text-foreground hover:text-secondary w-full">
                  <MessageCircle size={16} className="text-success" /> Chat en vivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guides */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Guías y Recursos</h3>
          <p className="text-sm text-muted-foreground">Documentos de ayuda descargables</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {guides.map((g, i) => (
            <button
              key={i}
              onClick={() => toast({ title: "Descarga disponible próximamente" })}
              className="bg-card rounded-lg border shadow-sm p-4 text-left hover:shadow-md hover:border-secondary/50 transition-all group"
            >
              {g.action === "Descargar" ? (
                <Download size={20} className="text-primary mb-2" />
              ) : (
                <ExternalLink size={20} className="text-primary mb-2" />
              )}
              <p className="text-xs font-medium text-foreground group-hover:text-secondary transition-colors">{g.label}</p>
              <p className="text-[10px] text-secondary mt-1">{g.action} &gt;</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">
          La información proporcionada en esta sección es orientativa y puede variar según cada caso particular. Nuestro equipo revisará tu situación de forma personalizada dentro de tu trámite activo.
        </p>
      </div>
    </div>
  );
};

export default Ayuda;
