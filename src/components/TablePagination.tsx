import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onNext: () => void;
  onPrev: () => void;
}

const TablePagination = ({ page, pageSize, totalCount, onNext, onPrev }: TablePaginationProps) => {
  const from = totalCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);
  const hasMore = (page + 1) * pageSize < totalCount;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
      <span className="text-xs text-muted-foreground">
        Mostrando {from}–{to} de {totalCount} registros
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          disabled={page === 0}
          onClick={onPrev}
        >
          <ChevronLeft size={14} /> Anterior
        </Button>
        <span className="text-xs text-muted-foreground px-2">
          Página {page + 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          disabled={!hasMore}
          onClick={onNext}
        >
          Siguiente <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
