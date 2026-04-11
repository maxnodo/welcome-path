import { useState, useEffect } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const RejectDocumentDialog = ({ open, onOpenChange, onConfirm }: RejectDocumentDialogProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rechazar documento</AlertDialogTitle>
          <AlertDialogDescription>
            Indica el motivo del rechazo para que el usuario pueda corregirlo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del rechazo (ej: documento ilegible, fecha vencida...)"
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(reason)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Rechazar documento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectDocumentDialog;
