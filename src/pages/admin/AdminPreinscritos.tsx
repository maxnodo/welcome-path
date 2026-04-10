import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAdminLeads } from "@/hooks/useAdminLeads";

const AdminPreinscritos = () => {
  const { leads, loading } = useAdminLeads();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Pre-inscritos</h2>
          <Badge variant="secondary">{leads.length} registros</Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No hay pre-inscritos aún.
        </div>
      ) : (
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Necesidad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Cuándo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nombre}</TableCell>
                  <TableCell>{lead.email ?? "—"}</TableCell>
                  <TableCell>{lead.telefono}</TableCell>
                  <TableCell>{lead.pais_origen ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px]">
                    {lead.necesidad ? (
                      <div className="flex flex-wrap gap-1">
                        {lead.necesidad.split(", ").map((n) => (
                          <span key={n} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{lead.ubicacion ?? "—"}</TableCell>
                  <TableCell>{lead.cuando ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] text-sm text-muted-foreground truncate">
                    {lead.descripcion ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPreinscritos;
