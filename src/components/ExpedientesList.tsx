import { FileText, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, User } from "lucide-react";
import { Expediente, ExpedienteStatus, DocumentoStatus } from "@/types/database.types";
import { useState } from "react";

const statusConfig: Record<ExpedienteStatus, { label: string; color: string; icon: typeof Clock }> = {
  no_iniciado: { label: "No iniciado", color: "text-muted-foreground", icon: Clock },
  documentacion_incompleta: { label: "Doc. incompleta", color: "text-warning", icon: AlertCircle },
  en_revision: { label: "En revisión", color: "text-secondary", icon: Clock },
  requerimiento_adicional: { label: "Requerimiento", color: "text-orange-500", icon: AlertCircle },
  presentado: { label: "Presentado", color: "text-purple-500", icon: Clock },
  aprobado: { label: "Aprobado", color: "text-success", icon: CheckCircle2 },
  finalizado: { label: "Finalizado", color: "text-primary", icon: CheckCircle2 },
  denegado: { label: "Denegado", color: "text-destructive", icon: XCircle },
  archivado: { label: "Archivado", color: "text-muted-foreground", icon: Clock },
};

const docStatusConfig: Record<DocumentoStatus, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-muted text-muted-foreground" },
  en_revision: { label: "En revisión", color: "bg-secondary/10 text-secondary" },
  validado: { label: "Validado", color: "bg-success/10 text-success" },
  rechazado: { label: "Rechazado", color: "bg-destructive/10 text-destructive" },
};

interface ExpedientesListProps {
  expedientes: Expediente[];
  advisorNames?: Map<string, string>;
}

export function ExpedientesList({ expedientes, advisorNames }: ExpedientesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (expedientes.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">
        Expedientes ({expedientes.length})
      </h4>
      <div className="space-y-2">
        {expedientes.map((exp) => {
          const st = statusConfig[exp.status];
          const StatusIcon = st.icon;
          const isOpen = expandedId === exp.id;
          const docs = exp.documentos ?? [];
          const dateStr = new Date(exp.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <div key={exp.id} className="rounded-md border bg-muted/20">
              <button
                onClick={() => setExpandedId(isOpen ? null : exp.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors rounded-md"
              >
                <StatusIcon size={16} className={st.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {exp.expediente_number ?? `EXP-${exp.id.slice(0, 8).toUpperCase()}`}
                    </span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${st.color} bg-current/5`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Creado {dateStr}
                    {exp.origin_country ? ` · ${exp.origin_country}` : ""}
                    {exp.solicitud_type ? ` · ${exp.solicitud_type}` : ""}
                    {exp.advisor_id && advisorNames?.get(exp.advisor_id) && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        · <User size={10} className="inline" /> {advisorNames.get(exp.advisor_id)}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {docs.length} doc{docs.length !== 1 ? "s" : ""}
                </span>
                <ChevronRight
                  size={14}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-3 pb-3 space-y-1">
                  {docs.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 pl-7">
                      No hay documentos subidos aún.
                    </p>
                  ) : (
                    docs.map((doc) => {
                      const ds = docStatusConfig[doc.status];
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 py-1.5 pl-7 text-xs"
                        >
                          <FileText size={13} className="text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate text-foreground">
                            {doc.file_name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ds.color}`}>
                            {ds.label}
                          </span>
                          {doc.rejection_reason && (
                            <span className="text-destructive text-[10px] max-w-[150px] truncate" title={doc.rejection_reason}>
                              {doc.rejection_reason}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
