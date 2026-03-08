import { useState } from "react";
import { Search, Download, FileEdit, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const invoices = [
  { id: "2024-005", fecha: "1 mayo 2024", periodo: "Mayo 2024", concepto: "Suscripción mensual", importe: "69,95€", status: "Pagada", metodo: "Tarjeta" },
  { id: "2024-004", fecha: "1 abril 2024", periodo: "Abril 2024", concepto: "Suscripción mensual", importe: "69,95€", status: "Pagada", metodo: "Tarjeta" },
  { id: "2024-003", fecha: "1 marzo 2024", periodo: "Marzo 2024", concepto: "Gestión adicional Certificado antecedentes", importe: "49,95€", status: "Pagada", metodo: "Tarjeta" },
  { id: "2024-002", fecha: "1 febrero 2024", periodo: "Febrero 2024", concepto: "Suscripción mensual", importe: "69,95€", status: "Pagada", metodo: "Tarjeta" },
  { id: "2024-001-B", fecha: "1 enero 2024", periodo: "Enero 2024", concepto: "Suscripción mensual", importe: "69,95€", status: "Pagada", metodo: "Tarjeta" },
  { id: "2024-001", fecha: "1 enero 2024", periodo: "Enero 2024", concepto: "Suscripción mensual", importe: "69,95€", status: "Pagada", metodo: "Tarjeta (Msa.)" },
];

const Facturas = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);

  const handleDownload = () => toast({ title: "Descarga iniciada" });

  const filtered = search
    ? invoices.filter((i) => i.id.includes(search) || i.concepto.toLowerCase().includes(search.toLowerCase()))
    : invoices;

  return (
    <div className="max-w-5xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Aquí puedes consultar y descargar todas las facturas correspondientes a tus pagos de suscripción y servicios contratados.
      </p>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar factura..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownload}><Download size={16} /> Descargar historial</Button>
        <Button variant="ghost" size="icon"><FileEdit size={18} /></Button>
      </div>

      <Tabs defaultValue="facturas">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="descargar">Descargar</TabsTrigger>
        </TabsList>

        <TabsContent value="facturas" className="space-y-4">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Factura Nº</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Periodo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Concepto</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Importe</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{inv.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.fecha}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.periodo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.concepto}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{inv.importe}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-success">✓ {inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="text-muted-foreground hover:text-foreground">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <button className="hover:text-foreground">&lt;</button>
            <span>1 de 1</span>
            <button className="hover:text-foreground">&gt;</button>
          </div>
        </TabsContent>

        <TabsContent value="descargar">
          <div className="bg-card rounded-lg border shadow-sm p-8 text-center space-y-3">
            <Download size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Selecciona un rango de fechas para descargar tus facturas en formato PDF.</p>
            <Button variant="outline" onClick={handleDownload}>Descargar todas las facturas</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md p-3">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground">Es necesario mantener las facturas al día para garantizar la continuidad del servicio y la entrega final de documentación.</p>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Factura Nº {selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-foreground">WCE WELCOME</p>
                <p className="text-xs text-muted-foreground">Immigration & Foreign Affairs</p>
                <p className="text-xs text-muted-foreground">CIF: B-12345678</p>
                <p className="text-xs text-muted-foreground">Madrid, España</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">Carlos García</p>
                <p className="text-xs text-muted-foreground">carlos.garcia@email.com</p>
                <p className="text-xs text-muted-foreground">México</p>
              </div>
            </div>

            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Concepto</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">Cantidad</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-3 py-2">{selectedInvoice?.concepto}</td>
                  <td className="px-3 py-2 text-center">1</td>
                  <td className="px-3 py-2 text-right">{selectedInvoice?.importe}</td>
                  <td className="px-3 py-2 text-right">{selectedInvoice?.importe}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-right space-y-1 text-xs">
              <p className="text-muted-foreground">Base imponible: 57,81€</p>
              <p className="text-muted-foreground">IVA (21%): 12,14€</p>
              <p className="font-semibold text-foreground text-sm">Total: {selectedInvoice?.importe}</p>
            </div>

            <p className="text-xs text-muted-foreground">Pago: {selectedInvoice?.fecha} — {selectedInvoice?.metodo}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDownload} className="gap-2"><Download size={14} /> Descargar PDF</Button>
            <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facturas;
