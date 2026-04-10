import { useState } from "react";
import { Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/database.types";

const roleBadge: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  gestor: "bg-primary/10 text-primary",
  user: "bg-muted text-muted-foreground",
};

const AdminUsuarios = () => {
  const { users, loading, changeRole } = useAdminUsers();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<{ userId: string; name: string; newRole: UserRole } | null>(null);

  const handleChangeRole = async () => {
    if (!confirm) return;
    const { error } = await changeRole(confirm.userId, confirm.newRole);
    if (!error) {
      toast({ title: "Rol actualizado", description: `${confirm.name} ahora es ${confirm.newRole}.` });
    } else {
      toast({ title: "Error", description: (error as any).message, variant: "destructive" });
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Gestión de usuarios</h2>
        <Badge variant="secondary">{users.length}</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[u.role] ?? ""}`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) =>
                        setConfirm({ userId: u.id, name: u.full_name ?? u.email ?? u.id, newRole: v as UserRole })
                      }
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="gestor">gestor</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={18} className="text-warning" /> Confirmar cambio de rol
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de cambiar el rol de <span className="font-semibold text-foreground">{confirm?.name}</span> a{" "}
            <span className="font-semibold text-foreground">{confirm?.newRole}</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button onClick={handleChangeRole}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
