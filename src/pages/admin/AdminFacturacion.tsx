import { useState } from "react";
import { Search, Filter, Receipt, DollarSign, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminFacturas } from "@/hooks/useAdminFacturas";

const statusLabels: Record<string, string> = {
  pagada: "Pagada",
  pendiente: "Pendiente",
  fallida: "Fallida",
  cancelada: "Cancelada",
};

const statusColor: Record<string, string> = {
  pagada: "bg-success/10 text-success",
  pendiente: "bg-warning/10 text-warning",
  fallida: "bg-destructive/10 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
};

const AdminFacturacion = () => {
  const { facturas, loading } = useAdminFacturas();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = facturas.filter((f) => {
    const user = (f as any).user;
    const matchSearch = !search ||
      f.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (user?.full_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = facturas.filter(f => f.status === "pagada").reduce((sum, f) => sum + f.total_amount, 0);
  const pendingAmount = facturas.filter(f => f.status === "pendiente").reduce((sum, f) => sum + f.total_amount, 0);
  const failedCount = facturas.filter(f => f.status === "fallida").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center"><DollarSign size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Facturado (pagado)</p>
            <p className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center"><Receipt size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Pendiente de cobro</p>
            <p className="text-2xl font-bold text-foreground">{pendingAmount.toFixed(2)} €</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Pagos fallidos</p>
            <p className="text-2xl font-bold text-foreground">{failedCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nº factura o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><Filter size={14} className="mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Nº Factura</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Concepto</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Periodo</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Base</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">IVA</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No hay facturas.</td></tr>
            ) : filtered.map((f) => {
              const user = (f as any).user;
              return (
                <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{f.invoice_number}</td>
                  <td className="px-4 py-3 font-medium text-foreground text-sm">{user?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{f.concept}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{f.period}</td>
                  <td className="px-4 py-3 text-foreground text-xs">{f.base_amount.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{(f.iva_amount ?? 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 font-semibold text-foreground text-xs">{f.total_amount.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[f.status] ?? ""}`}>
                      {statusLabels[f.status] ?? f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(f.issued_at).toLocaleDateString("es-ES")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFacturacion;
