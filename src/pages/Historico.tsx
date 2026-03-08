import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, ChevronRight, CheckCircle, XCircle, Archive, ClipboardList, Paperclip, Play, AlertTriangle } from "lucide-react";

const statusBadge = (status: string) => {
  const map: Record<string, { color: string; label: string }> = {
    aprobado: { color: "bg-success/10 text-success", label: "Aprobado" },
    resuelto: { color: "bg-success/10 text-success", label: "Resuelto" },
    denegado: { color: "bg-destructive/10 text-destructive", label: "Denegado" },
    archivado: { color: "bg-muted text-muted-foreground", label: "Archivado" },
    validado: { color: "text-success", label: "✓ Validado" },
    pagada: { color: "text-success", label: "✓ Pagada" },
  };
  const s = map[status] ?? { color: "bg-muted text-muted-foreground", label: status };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
};

const tramitesData = [
  { name: "Nacionalidad Española", sub: "Expediente: 87596-NAC", fecha: "22 enero 2023", status: "aprobado", resultado: "20 abril 2024", hasDownload: true },
  { name: "NIE – Número de Identidad de Extranjero", sub: "Expediente: 8821", fecha: "10 noviembre 2022", status: "resuelto", resultado: "25 enero 2023", hasDownload: true },
  { name: "DNI – Documento Nacional de Identidad", sub: "Consulta previa cerrada", extra: "Solicitud denegada por falta de documentación.", fecha: "5 julio 2022", status: "denegado", resultado: "10 agosto 2022", hasDownload: false },
  { name: "Consulta general", sub: "Acceso laboral en España", fecha: "23 abril 2022", status: "archivado", resultado: "5 mayo 2022", hasDownload: true },
];

const docsData = [
  { name: "Pasaporte.pdf", tramite: "Nacionalidad", fecha: "25 ene 2023", status: "validado", gestor: "María López" },
  { name: "Cert_nacimiento.pdf", tramite: "Nacionalidad", fecha: "25 ene 2023", status: "validado", gestor: "María López" },
  { name: "Antecedentes_ES.pdf", tramite: "Nacionalidad", fecha: "1 feb 2023", status: "validado", gestor: "María López" },
  { name: "Empadronamiento.pdf", tramite: "NIE", fecha: "12 nov 2022", status: "validado", gestor: "Carlos Martínez" },
  { name: "Formulario_NIE.pdf", tramite: "NIE", fecha: "12 nov 2022", status: "validado", gestor: "Carlos Martínez" },
];

const commsData = [
  { date: "20 abril 2024", icon: CheckCircle, iconColor: "text-success", title: "Resolución aprobada", desc: "Tu solicitud de Nacionalidad Española fue aprobada por el Ministerio de Justicia." },
  { date: "20 marzo 2023", icon: ClipboardList, iconColor: "text-secondary", title: "Expediente presentado", desc: "Tu expediente de Nacionalidad Española fue presentado ante las autoridades competentes." },
  { date: "5 febrero 2023", icon: Paperclip, iconColor: "text-primary", title: "Documentación completa", desc: "Toda la documentación requerida fue recibida y validada por el gestor." },
  { date: "22 enero 2023", icon: Play, iconColor: "text-muted-foreground", title: "Trámite iniciado", desc: "Se inició el trámite de Nacionalidad Española." },
];

const pagosData = [
  { factura: "2024-004", periodo: "Abril 2024", importe: "69,95€", status: "pagada", metodo: "Tarjeta" },
  { factura: "2024-003", periodo: "Marzo 2024", importe: "69,95€", status: "pagada", metodo: "Bizum" },
  { factura: "2024-002", periodo: "Febrero 2024", importe: "69,95€", status: "pagada", metodo: "Tarjeta" },
  { factura: "2024-001", periodo: "Enero 2024", importe: "69,95€", status: "pagada", metodo: "Tarjeta" },
];

const timelinePoints = [
  { label: "Inicio", date: "22 ene 2023", completed: true },
  { label: "Ingreso de documentación", date: "5 feb 2023", completed: true },
  { label: "Revisión", date: "20 mar 2023", completed: true },
  { label: "Resolución", date: "", completed: false },
  { label: "Resultado", date: "20 abr 2024", completed: true },
];

const Historico = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const handleDownload = () => {
    toast({ title: "Descarga iniciada", description: "El archivo se está descargando." });
  };

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
                {tramitesData.map((t, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.sub}</p>
                      {t.extra && <p className="text-xs text-destructive mt-0.5">{t.extra}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.fecha}</td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.resultado}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.hasDownload && (
                          <>
                            <button onClick={handleDownload} className="text-muted-foreground hover:text-foreground"><Download size={16} /></button>
                            <button className="text-muted-foreground hover:text-foreground"><FileText size={16} /></button>
                          </>
                        )}
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">Nacionalidad Española</h3>
            <div className="relative flex items-center justify-between">
              {/* Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
              <div className="absolute top-4 left-0 h-0.5 bg-primary" style={{ width: "80%" }} />
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

          {/* Warning */}
          <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
            <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">
              Mantén tus pagos al día para asegurar la entrega final de tus trámites con las autoridades.
            </p>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Gestor</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {docsData.map((d, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <FileText size={14} className="text-primary" /> {d.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.tramite}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.fecha}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.gestor}</td>
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
            {commsData.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className={`flex gap-4 py-4 ${i < commsData.length - 1 ? "border-b" : ""}`}>
                  <div className="w-24 shrink-0 text-xs text-muted-foreground pt-1">{c.date}</div>
                  <div className="flex items-start gap-3 relative">
                    {/* Vertical line */}
                    {i < commsData.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" style={{ height: "calc(100% + 16px)" }} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted z-10`}>
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
                {pagosData.map((p, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.factura}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.periodo}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{p.importe}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.metodo}</td>
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
