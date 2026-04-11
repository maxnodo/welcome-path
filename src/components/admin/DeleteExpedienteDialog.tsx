import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteExpedienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}

const DeleteExpedienteDialog = ({ open, onOpenChange, onConfirm, deleting }: DeleteExpedienteDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción eliminará permanentemente el expediente y todos sus documentos asociados. No se puede deshacer.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          {deleting ? "Eliminando..." : "Eliminar"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteExpedienteDialog;
