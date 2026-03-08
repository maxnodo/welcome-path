import { useState } from "react";
import { ChevronDown, Check, Upload, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

const countries = [
  "Alemania", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos", "Francia",
  "Guatemala", "Honduras", "Italia", "México", "Nicaragua", "Panamá", "Paraguay",
  "Perú", "Portugal", "Reino Unido", "República Dominicana", "Uruguay", "Venezuela",
];

type Status = "no_iniciado" | "doc_incompleta" | "en_revision" | "requerimiento" | "presentado" | "aprobado" | "finalizado";

const statusConfig: Record<Status, { label: string; color: string }> = {
  no_iniciado: { label: "No iniciado", color: "bg-gray-400" },
  doc_incompleta: { label: "Documentación incompleta", color: "bg-warning" },
  en_revision: { label: "En revisión", color: "bg-secondary" },
  requerimiento: { label: "Requerimiento adicional", color: "bg-orange-500" },
  presentado: { label: "Presentado", color: "bg-purple-500" },
  aprobado: { label: "Aprobado", color: "bg-success" },
  finalizado: { label: "Finalizado", color: "bg-primary" },
};

interface DocItem {
  label: string;
  key: string;
}

interface TramiteConfig {
  id: string;
  badge: string;
  badgeColor: string;
  name: string;
  description: string;
  docs: DocItem[];
  hasCountrySelector?: boolean;
  hasTypeSelector?: boolean;
  extraDocsByType?: Record<string, DocItem[]>;
}

const tramites: TramiteConfig[] = [
  {
    id: "nie",
    badge: "IE",
    badgeColor: "bg-secondary text-secondary-foreground",
    name: "NIE – Número de Identidad de Extranjero",
    description: "El NIE es el número de identificación para extranjeros en España, necesario para realizar cualquier trámite administrativo, fiscal o laboral.",
    hasCountrySelector: true,
    docs: [
      { key: "pasaporte", label: "Pasaporte completo en vigor (PDF/JPG)" },
      { key: "ex15", label: "Formulario EX-15 cumplimentado" },
      { key: "tasas", label: "Justificante de pago de tasas" },
      { key: "empadronamiento", label: "Certificado de empadronamiento" },
      { key: "foto", label: "Fotografía reciente (JPG)" },
    ],
  },
  {
    id: "dni",
    badge: "RE",
    badgeColor: "bg-success text-success-foreground",
    name: "DNI – Documento Nacional de Identidad",
    description: "El DNI es el documento de identidad para ciudadanos españoles. Si has obtenido la nacionalidad española, deberás tramitar tu DNI en la oficina correspondiente.",
    docs: [
      { key: "cert_nacionalidad", label: "Certificado de nacionalidad española" },
      { key: "foto", label: "Fotografía reciente fondo blanco (JPG)" },
      { key: "tasas", label: "Justificante de pago de tasas" },
      { key: "empadronamiento", label: "Certificado de empadronamiento" },
    ],
  },
  {
    id: "nacionalidad",
    badge: "NA",
    badgeColor: "bg-gray-500 text-white",
    name: "Nacionalidad Española",
    description: "La Nacionalidad Española es el procedimiento mediante el cual un ciudadano extranjero puede adquirir la nacionalidad del Reino de España, siempre que cumpla los requisitos legales establecidos por el Código Civil.",
    hasCountrySelector: true,
    hasTypeSelector: true,
    docs: [
      { key: "pasaporte", label: "Pasaporte completo en vigor (PDF/JPG)" },
      { key: "nacimiento", label: "Certificado de nacimiento" },
      { key: "antecedentes", label: "Certificado de Antecedentes penales" },
      { key: "tasas", label: "Justificante de pago (Tasas)" },
      { key: "empadronamiento", label: "Empadronamiento" },
      { key: "formulario", label: "Formulario de solicitud" },
    ],
    extraDocsByType: {
      matrimonio: [
        { key: "matrimonio_cert", label: "Certificado literal de matrimonio" },
        { key: "dni_conyuge", label: "DNI del cónyuge español" },
      ],
      residencia: [
        { key: "diplomas", label: "Diplomas CCSE / DELE" },
      ],
    },
  },
  {
    id: "arraigo",
    badge: "AS",
    badgeColor: "bg-orange-500 text-white",
    name: "Arraigo Social",
    description: "El arraigo social permite obtener una autorización de residencia temporal para extranjeros que lleven 3 años en España y acrediten vínculos laborales o familiares.",
    docs: [
      { key: "pasaporte", label: "Pasaporte completo (PDF/JPG)" },
      { key: "empadronamiento", label: "Certificado de empadronamiento (3 años)" },
      { key: "contrato", label: "Contrato de trabajo o oferta laboral" },
      { key: "antecedentes", label: "Certificado de antecedentes penales" },
      { key: "informe_arraigo", label: "Informe de arraigo social" },
    ],
  },
  {
    id: "renovacion",
    badge: "RN",
    badgeColor: "bg-purple-500 text-white",
    name: "Renovación de Permiso de Residencia",
    description: "Tramitación de la renovación de tu permiso de residencia o trabajo antes de su fecha de vencimiento. Se recomienda iniciar el proceso 60 días antes del vencimiento.",
    docs: [
      { key: "pasaporte", label: "Pasaporte en vigor (PDF/JPG)" },
      { key: "tie", label: "TIE actual (tarjeta de identidad extranjero)" },
      { key: "vida_laboral", label: "Informe de vida laboral" },
      { key: "contrato", label: "Contrato de trabajo vigente" },
      { key: "tasas", label: "Justificante de pago de tasas" },
    ],
  },
  {
    id: "reagrupacion",
    badge: "RF",
    badgeColor: "bg-teal-500 text-white",
    name: "Reagrupación Familiar",
    description: "Permite a los extranjeros residentes legales en España solicitar que sus familiares directos puedan residir junto a ellos en el país.",
    docs: [
      { key: "pasaporte_reagrupante", label: "Pasaporte del reagrupante (PDF/JPG)" },
      { key: "tie_reagrupante", label: "TIE del reagrupante en vigor" },
      { key: "parentesco", label: "Libro de familia o certificado de parentesco" },
      { key: "medios_economicos", label: "Justificante de medios económicos" },
      { key: "vivienda", label: "Contrato de arrendamiento o propiedad" },
      { key: "pasaporte_familiar", label: "Pasaporte del familiar a reagrupar" },
    ],
  },
];

// Per-file upload button
const DocUploadRow = ({
  doc,
  file,
  checked,
  onCheck,
  onFile,
}: {
  doc: DocItem;
  file: File | null;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onFile: (f: File | null) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheck(v === true)} />
      <span className="flex-1 text-sm text-foreground">{doc.label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {file ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check size={14} />
            <span className="max-w-[120px] truncate">{file.name}</span>
          </span>
        ) : null}
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} className="gap-1 text-xs">
          <Upload size={12} /> Subir archivo
        </Button>
        <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </div>
    </div>
  );
};

// State per tramite
interface TramiteState {
  files: Record<string, File | null>;
  checks: Record<string, boolean>;
  confirm1: boolean;
  confirm2: boolean;
  country: string;
  countryValidation: boolean;
  solicitudType: string;
}

const createInitialState = (): TramiteState => ({
  files: {},
  checks: {},
  confirm1: false,
  confirm2: false,
  country: "",
  countryValidation: false,
  solicitudType: "residencia",
});

const Tramites = () => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, TramiteState>>(() => {
    const s: Record<string, TramiteState> = {};
    tramites.forEach((t) => (s[t.id] = createInitialState()));
    return s;
  });
  const [statuses] = useState<Record<string, Status>>(() => {
    const s: Record<string, Status> = {};
    tramites.forEach((t) => (s[t.id] = "no_iniciado"));
    return s;
  });

  const update = (id: string, patch: Partial<TramiteState>) => {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const setFile = (id: string, key: string, file: File | null) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], files: { ...prev[id].files, [key]: file } },
    }));
  };

  const setCheck = (id: string, key: string, v: boolean) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], checks: { ...prev[id].checks, [key]: v } },
    }));
  };

  const handleSend = (id: string) => {
    toast({ title: "Documentación enviada para revisión", description: `Trámite: ${tramites.find((t) => t.id === id)?.name}` });
  };

  const getAllDocs = (t: TramiteConfig, state: TramiteState): DocItem[] => {
    let docs = [...t.docs];
    if (t.extraDocsByType && state.solicitudType) {
      const extra = t.extraDocsByType[state.solicitudType];
      if (extra) docs = [...docs, ...extra];
    }
    return docs;
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Consulta el estado de tus trámites y sube la documentación requerida. Selecciona un trámite para comenzar.
          </p>
        </div>
        <Button className="shrink-0 gap-2">+ Iniciar nuevo trámite</Button>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {tramites.map((t) => {
          const isOpen = expanded === t.id;
          const st = states[t.id];
          const status = statuses[t.id];
          const { label: statusLabel, color: statusColor } = statusConfig[status];
          const allDocs = getAllDocs(t, st);

          return (
            <div key={t.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
              {/* Collapsed header */}
              <button
                onClick={() => setExpanded(isOpen ? null : t.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${t.badgeColor}`}>
                  {t.badge}
                </span>
                <span className="flex-1 font-medium text-foreground">{t.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                  {statusLabel}
                </span>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-5 pt-0 space-y-5 border-t">
                  <p className="text-sm text-muted-foreground pt-4">{t.description}</p>

                  {/* Type selector for Nacionalidad */}
                  {t.hasTypeSelector && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Tipo de solicitud</label>
                      <RadioGroup
                        value={st.solicitudType}
                        onValueChange={(v) => update(t.id, { solicitudType: v })}
                        className="flex flex-wrap gap-4"
                      >
                        {[
                          { value: "residencia", label: "Por residencia" },
                          { value: "matrimonio", label: "Por matrimonio" },
                          { value: "opcion", label: "Por opción" },
                          { value: "naturalizacion", label: "Por naturalización" },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value={opt.value} />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Country selector */}
                  {t.hasCountrySelector && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">País de origen</label>
                        <Select value={st.country} onValueChange={(v) => update(t.id, { country: v })}>
                          <SelectTrigger className="max-w-xs"><SelectValue placeholder="Selecciona tu país" /></SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={st.countryValidation}
                          onCheckedChange={(v) => update(t.id, { countryValidation: v === true })}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground">Mi país se encuentra entre los países que requieren validación adicional</span>
                      </div>
                      {st.countryValidation && (
                        <div className="flex items-start gap-2 text-secondary text-sm bg-secondary/5 p-3 rounded-md">
                          <Info size={16} className="shrink-0 mt-0.5" />
                          <span>(+) El gestor se comunicará contigo para indicarte los requisitos específicos.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document checklist */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-foreground mb-2">Documentación requerida</h4>
                    {allDocs.map((doc) => (
                      <DocUploadRow
                        key={doc.key}
                        doc={doc}
                        file={st.files[doc.key] ?? null}
                        checked={st.checks[doc.key] ?? false}
                        onCheck={(v) => setCheck(t.id, doc.key, v)}
                        onFile={(f) => setFile(t.id, doc.key, f)}
                      />
                    ))}
                  </div>

                  {/* Confirmation checkboxes */}
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={st.confirm1} onCheckedChange={(v) => update(t.id, { confirm1: v === true })} className="mt-0.5" />
                      <span className="text-sm text-foreground">Confirmo que la documentación subida es auténtica y corresponde a mi situación real.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox checked={st.confirm2} onCheckedChange={(v) => update(t.id, { confirm2: v === true })} className="mt-0.5" />
                      <span className="text-sm text-foreground">Entiendo que cualquier falsedad puede generar la paralización del expediente y consecuencias legales.</span>
                    </div>
                  </div>

                  {/* Send button */}
                  <Button
                    className="w-full"
                    disabled={!st.confirm1 || !st.confirm2}
                    onClick={() => handleSend(t.id)}
                  >
                    Enviar documentación para su revisión
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tramites;
