import { useState } from "react";
import { Search, Download, FileEdit, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFacturas } from "@/hooks/useFacturas";
import { Factura } from "@/types/database.types";
import { useAuth } from "@/context/AuthContext";

const Facturas = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { facturas, loading } = useFacturas();
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);

  const handleDownload = () => toast({ title: "Descarga iniciada" });

  const filtered = search
    ? facturas.filter((i) => i.invoice_number.includes(search) || i.concept.toLowerCase().includes(search.toLowerCase()))
    : facturas;

  const formatCurrency = (amount: number) => `${amount.toFixed(2).replace('.', ',')}€`;

  const statusLabel = (s: string) => {
    const map: Record<string, { color: string; label: string }> = {
      pagada: { color: "text-success", label: "✓ Pagada" },
      pendiente: { color: "text-warning", label: "⏳ Pendiente" },
      fallida: { color: "text-destructive", label: "✗ Fallida" },
      cancelada: { color: "text-muted-foreground", label: "Cancelada" },
    };
    const m = map[s] ?? { color: "text-muted-foreground", label: s };
    return <span className={`text-xs font-medium ${m.color}`}>{m.label}</span>;
  };

  if (loading) {
    return <div className="max-w-5xl"><p className="text-sm text-muted-foreground">Cargando facturas...</p></div>;
  }

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
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No hay facturas disponibles.</td></tr>
                ) : filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.period}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.concept}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-4 py-3">{statusLabel(inv.status)}</td>
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
            <DialogTitle>Factura Nº {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-foreground">WCE WELCOME</p>
                  <p className="text-xs text-muted-foreground">Immigration & Foreign Affairs</p>
                  <p className="text-xs text-muted-foreground">CIF: B-12345678</p>
                  <p className="text-xs text-muted-foreground">Madrid, España</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{profile?.full_name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email ?? ""}</p>
                  <p className="text-xs text-muted-foreground">{profile?.nationality ?? ""}</p>
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
                    <td className="px-3 py-2">{selectedInvoice.concept}</td>
                    <td className="px-3 py-2 text-center">1</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedInvoice.total_amount)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedInvoice.total_amount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-right space-y-1 text-xs">
                <p className="text-muted-foreground">Base imponible: {formatCurrency(selectedInvoice.base_amount)}</p>
                <p className="text-muted-foreground">IVA ({selectedInvoice.iva_rate}%): {formatCurrency(selectedInvoice.iva_amount ?? 0)}</p>
                <p className="font-semibold text-foreground text-sm">Total: {formatCurrency(selectedInvoice.total_amount)}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                Pago: {selectedInvoice.payment_date ? new Date(selectedInvoice.payment_date).toLocaleDateString("es-ES") : "—"} — {selectedInvoice.payment_method ?? "—"}
              </p>
            </div>
          )}
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
