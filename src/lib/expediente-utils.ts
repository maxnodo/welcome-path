import { ExpedienteStatus } from "@/types/database.types";

export const allStatuses: ExpedienteStatus[] = [
  "no_iniciado", "documentacion_incompleta", "en_revision", "requerimiento_adicional",
  "presentado", "aprobado", "finalizado", "denegado", "archivado",
];

export const statusLabels: Record<ExpedienteStatus, string> = {
  no_iniciado: "No iniciado",
  documentacion_incompleta: "Doc. incompleta",
  en_revision: "En revisión",
  requerimiento_adicional: "Requerimiento",
  presentado: "Presentado",
  aprobado: "Aprobado",
  finalizado: "Finalizado",
  denegado: "Denegado",
  archivado: "Archivado",
};

export const statusColor = (s: string) => {
  const map: Record<string, string> = {
    en_revision: "bg-secondary/10 text-secondary",
    documentacion_incompleta: "bg-warning/10 text-warning",
    presentado: "bg-purple-500/10 text-purple-600",
    aprobado: "bg-success/10 text-success",
    finalizado: "bg-success/10 text-success",
    no_iniciado: "bg-muted text-muted-foreground",
    requerimiento_adicional: "bg-orange-500/10 text-orange-600",
    denegado: "bg-destructive/10 text-destructive",
    archivado: "bg-muted text-muted-foreground",
  };
  return map[s] ?? "bg-muted text-muted-foreground";
};
