import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, ChevronRight, CheckCircle, ClipboardList, Paperclip, Play, AlertTriangle } from "lucide-react";
import { useExpedientes } from "@/hooks/useExpedientes";
import { useFacturas } from "@/hooks/useFacturas";
import { useMensajes } from "@/hooks/useMensajes";
import { ExpedienteStatus } from "@/types/database.types";

const statusBadge = (status: string) => {
  const map: Record<string, { color: string; label: string }> = {
    aprobado: { color: "bg-success/10 text-success", label: "Aprobado" },
    finalizado: { color: "bg-success/10 text-success", label: "Finalizado" },
    denegado: { color: "bg-destructive/10 text-destructive", label: "Denegado" },
    archivado: { color: "bg-muted text-muted-foreground", label: "Archivado" },
    en_revision: { color: "bg-secondary/10 text-secondary", label: "En revisión" },
    presentado: { color: "bg-purple-500/10 text-purple-600", label: "Presentado" },
    no_iniciado: { color: "bg-muted text-muted-foreground", label: "No iniciado" },
    documentacion_incompleta: { color: "bg-warning/10 text-warning", label: "Doc. incompleta" },
    requerimiento_adicional: { color: "bg-orange-500/10 text-orange-600", label: "Requerimiento" },
    validado: { color: "text-success", label: "✓ Validado" },
    pendiente: { color: "text-warning", label: "⏳ Pendiente" },
    rechazado: { color: "text-destructive", label: "✗ Rechazado" },
    pagada: { color: "text-success", label: "✓ Pagada" },
  };
  const s = map[status] ?? { color: "bg-muted text-muted-foreground", label: status };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
};

const Historico = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const { expedientes, loading: expLoading } = useExpedientes();
  const { facturas, loading: facLoading } = useFacturas();
  const { mensajes } = useMensajes();

  const handleDownload = () => {
    toast({ title: "Descarga iniciada", description: "El archivo se está descargando." });
  };

  // Build docs list from expedientes
  const allDocs = expedientes.flatMap(exp =>
    (exp.documentos ?? []).map(doc => ({
      ...doc,
      tramiteName: exp.tramites_catalog?.name ?? exp.tramite_code,
    }))
  );

  // Build comms from messages (simplified)
  const comms = mensajes.slice(0, 10).map(m => ({
    date: new Date(m.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    icon: m.is_read ? CheckCircle : ClipboardList,
    iconColor: m.is_read ? "text-success" : "text-secondary",
    title: m.content.slice(0, 50),
    desc: m.content,
  }));

  // Timeline for first expediente
  const firstExp = expedientes[0];
  const timelinePoints = firstExp ? [
    { label: "Inicio", date: new Date(firstExp.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }), completed: true },
    { label: "Documentación", date: firstExp.submitted_at ? new Date(firstExp.submitted_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "", completed: !!firstExp.submitted_at },
    { label: "Revisión", date: "", completed: ["en_revision", "presentado", "aprobado", "finalizado"].includes(firstExp.status) },
    { label: "Resolución", date: "", completed: ["aprobado", "finalizado", "denegado"].includes(firstExp.status) },
    { label: "Resultado", date: firstExp.resolved_at ? new Date(firstExp.resolved_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "", completed: !!firstExp.resolved_at },
  ] : [];

  return (
    <div className="max-w-5xl space-y-6">
      <p className="text-sm text-muted-foreground">
        En esta sección puedes consultar el historial completo de tus trámites, documentos enviados, estados del expediente y comunicaciones registradas dentro de la plataforma.
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownload}>
          <Download size={16} /> Descargar historial
        </Button>
      </div>

      <Tabs defaultValue="tramites">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tramites">Trámites</TabsTrigger>
          <TabsTrigger value="documentacion">Documentación</TabsTrigger>
          <TabsTrigger value="comunicaciones">Comunicaciones</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        {/* Trámites */}
        <TabsContent value="tramites" className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trámite</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fecha de Inicio</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Resultado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground w-24"></th>
                </tr>
              </thead>
              <tbody>
                {expLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : expedientes.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay trámites registrados.</td></tr>
                ) : expedientes.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{t.tramites_catalog?.name ?? t.tramite_code}</p>
                      <p className="text-xs text-muted-foreground">Expediente: {t.expediente_number ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.resolved_at ? new Date(t.resolved_at).toLocaleDateString("es-ES") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground"><Download size={16} /></button>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          {firstExp && timelinePoints.length > 0 && (
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h3 className="text-sm font-semibold text-foreground mb-6">{firstExp.tramites_catalog?.name ?? firstExp.tramite_code}</h3>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
                <div className="absolute top-4 left-0 h-0.5 bg-primary" style={{ width: `${(timelinePoints.filter(p => p.completed).length / timelinePoints.length) * 100}%` }} />
                {timelinePoints.map((pt, i) => (
                  <div key={i} className="relative flex flex-col items-center z-10" style={{ minWidth: 80 }}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      pt.completed ? "bg-primary border-primary" : "bg-card border-border"
                    }`}>
                      {pt.completed && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <p className="text-xs font-medium text-foreground mt-2 text-center">{pt.label}</p>
                    {pt.date && <p className="text-[10px] text-muted-foreground text-center">{pt.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
            <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">Mantén tus pagos al día para asegurar la entrega final de tus trámites con las autoridades.</p>
          </div>
        </TabsContent>

        {/* Documentación */}
        <TabsContent value="documentacion">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Documento</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trámite</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fecha subida</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {allDocs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay documentos registrados.</td></tr>
                ) : allDocs.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <FileText size={14} className="text-primary" /> {d.file_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.tramiteName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString("es-ES")}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3">
                      <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground"><Download size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Comunicaciones */}
        <TabsContent value="comunicaciones">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-0">
            {comms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay comunicaciones registradas.</p>
            ) : comms.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className={`flex gap-4 py-4 ${i < comms.length - 1 ? "border-b" : ""}`}>
                  <div className="w-24 shrink-0 text-xs text-muted-foreground pt-1">{c.date}</div>
                  <div className="flex items-start gap-3 relative">
                    {i < comms.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" style={{ height: "calc(100% + 16px)" }} />
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted z-10">
                      <Icon size={16} className={c.iconColor} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Pagos */}
        <TabsContent value="pagos">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Factura Nº</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Periodo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Importe</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Método</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {facLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : facturas.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay pagos registrados.</td></tr>
                ) : facturas.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.invoice_number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.period}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.total_amount.toFixed(2).replace('.', ',')}€</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.payment_method ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground"><Download size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Historico;
