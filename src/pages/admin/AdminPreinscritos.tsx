import { useState, useEffect } from "react";
import { ArrowRightLeft, Check, Mail, AlertCircle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminLeads, Lead } from "@/hooks/useAdminLeads";
import TablePagination from "@/components/TablePagination";
import { useGestores, getGestorName } from "@/hooks/useGestores";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { notifyGestorAssignment } from "@/lib/notifyGestorAssignment";

interface MatchedUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

const AdminPreinscritos = () => {
  const { user, isAdmin } = useAuth();
  const { leads, loading, updateLead, page, totalCount, pageSize, hasMore, nextPage, prevPage } = useAdminLeads();
  const { gestores } = useGestores();
  const { toast } = useToast();
  const [converting, setConverting] = useState<string | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertTramite, setConvertTramite] = useState("");
  const [tramites, setTramites] = useState<{ code: string; name: string }[]>([]);

  // User lookup states
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);

  useEffect(() => {
    supabase.from('tramites_catalog').select('code, name').eq('is_active', true).then(({ data }) => {
      setTramites(data ?? []);
    });
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleAssignGestor = async (leadId: string, advisorId: string) => {
    const { error } = await updateLead(leadId, { advisor_id: advisorId });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openConvertDialog = async (lead: Lead) => {
    setConvertLead(lead);
    setConvertTramite("");
    setMatchedUser(null);
    setInvitationSent(false);
    setSendingInvitation(false);

    if (!lead.email) return;

    setSearchingUser(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', lead.email)
      .maybeSingle();

    setMatchedUser(data as MatchedUser | null);
    setSearchingUser(false);
  };

  const handleSendInvitation = async () => {
    if (!convertLead?.email) return;
    setSendingInvitation(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: convertLead.email,
      options: {
        shouldCreateUser: true,
      },
    });

    setSendingInvitation(false);

    if (error) {
      toast({ title: "Error al enviar invitación", description: error.message, variant: "destructive" });
    } else {
      setInvitationSent(true);
      toast({ title: "Invitación enviada", description: `Se envió un enlace de acceso a ${convertLead.email}.` });
    }
  };

  const handleConvertLead = async () => {
    if (!convertLead || !convertLead.advisor_id || !user || !convertTramite || !matchedUser) return;

    setConverting(convertLead.id);

    const { data: expData, error: expError } = await supabase
      .from('expedientes')
      .insert({
        user_id: matchedUser.id,
        tramite_code: convertTramite,
        status: 'no_iniciado' as const,
        advisor_id: convertLead.advisor_id,
        origin_country: convertLead.pais_origen ?? null,
      })
      .select('id, tramite_code')
      .maybeSingle();

    if (expError) {
      toast({ title: "Error al crear expediente", description: expError.message, variant: "destructive" });
      setConverting(null);
      return;
    }

    await updateLead(convertLead.id, { status: 'converted' });

    const tramiteName = tramites.find(t => t.code === convertTramite)?.name ?? convertTramite;
    await notifyGestorAssignment({
      advisorId: convertLead.advisor_id,
      tramiteName,
      userName: convertLead.nombre,
      expedienteId: expData?.id ?? null,
      createdBy: user.id,
    });

    toast({ title: "Lead convertido", description: `Se creó un expediente para ${convertLead.nombre} vinculado al usuario ${matchedUser.full_name ?? matchedUser.email}.` });
    setConverting(null);
    setConvertLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">Pre-inscritos</h2>
          <Badge variant="secondary">{totalCount} registros</Badge>
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
        <div className="border rounded-lg bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Necesidad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const isConverted = lead.status === "converted";
                return (
                  <TableRow key={lead.id} className={isConverted ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{lead.nombre}</TableCell>
                    <TableCell>{lead.email ?? "—"}</TableCell>
                    <TableCell>{lead.telefono}</TableCell>
                    <TableCell>{lead.pais_origen ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {lead.necesidad ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.necesidad.split(", ").map((n) => (
                            <span key={n} className="text-xs bg-muted px-2 py-0.5 rounded-full">{n}</span>
                          ))}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      {isConverted ? (
                        <span className="text-xs text-muted-foreground">{getGestorName(gestores, lead.advisor_id) ?? "—"}</span>
                      ) : isAdmin ? (
                        <Select
                          value={lead.advisor_id ?? ""}
                          onValueChange={(v) => handleAssignGestor(lead.id, v)}
                        >
                          <SelectTrigger className="h-8 text-xs w-[140px]">
                            <SelectValue placeholder="Asignar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {gestores.map(g => (
                              <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">{getGestorName(gestores, lead.advisor_id) ?? "Sin asignar"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isConverted ? (
                        <Badge variant="outline" className="text-xs gap-1 border-success/30 text-success">
                          <Check size={10} /> Convertido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isConverted && isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          disabled={!lead.advisor_id || converting === lead.id}
                          onClick={() => openConvertDialog(lead)}
                        >
                          <ArrowRightLeft size={12} />
                          {converting === lead.id ? "Convirtiendo..." : "Convertir"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {!loading && totalCount > 0 && (
          <TablePagination page={page} pageSize={pageSize} totalCount={totalCount} onNext={nextPage} onPrev={prevPage} />
        )}
      </div>
      )}

      {/* Convert lead dialog */}
      <Dialog open={!!convertLead} onOpenChange={() => setConvertLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convertir lead en expediente</DialogTitle>
          </DialogHeader>
          {convertLead && (
            <div className="space-y-4">
              {/* Lead info */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-foreground">{convertLead.nombre}</p>
                <p className="text-muted-foreground">{convertLead.email ?? convertLead.telefono}</p>
                {convertLead.necesidad && (
                  <div className="pt-1">
                    <span className="text-xs text-muted-foreground">Necesidad indicada: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {convertLead.necesidad.split(", ").map((n) => (
                        <span key={n} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User lookup result */}
              {searchingUser ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  Buscando usuario con email {convertLead.email}...
                </div>
              ) : matchedUser ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <UserCheck size={16} className="text-success shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{matchedUser.full_name ?? matchedUser.email}</p>
                    <p className="text-muted-foreground text-xs">Usuario encontrado — se vinculará al expediente</p>
                  </div>
                </div>
              ) : !convertLead.email ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle size={16} className="text-destructive shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Este lead no tiene email. No es posible vincular ni invitar a un usuario sin dirección de correo.
                  </p>
                </div>
              ) : invitationSent ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Mail size={16} className="text-primary shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Invitación enviada a {convertLead.email}</p>
                    <p className="text-muted-foreground text-xs">
                      Una vez que el usuario se registre desde el enlace, podrás volver a intentar la conversión.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <AlertCircle size={16} className="text-warning shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      No existe una cuenta de usuario con el email <span className="font-medium text-foreground">{convertLead.email}</span>.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleSendInvitation}
                    disabled={sendingInvitation}
                  >
                    <Mail size={14} />
                    {sendingInvitation ? "Enviando..." : "Enviar invitación por email"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    O el usuario puede registrarse por su cuenta en la plataforma.
                  </p>
                </div>
              )}

              {/* Tramite selector */}
              <div className="space-y-2">
                <Label className="text-sm">Trámite a crear <span className="text-destructive">*</span></Label>
                <Select value={convertTramite} onValueChange={setConvertTramite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar trámite del catálogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tramites.map(t => (
                      <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Gestor asignado: <span className="text-foreground font-medium">{getGestorName(gestores, convertLead.advisor_id)}</span></p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertLead(null)}>Cancelar</Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleConvertLead}
                      disabled={!convertTramite || !matchedUser || converting === convertLead?.id}
                    >
                      {converting === convertLead?.id ? "Convirtiendo..." : "Crear expediente"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!matchedUser && (
                  <TooltipContent>
                    <p>{!convertLead?.email ? "Se necesita el email del contacto" : "El usuario debe tener una cuenta para crear el expediente"}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPreinscritos;
