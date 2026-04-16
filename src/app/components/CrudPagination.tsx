import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "./ui/button";

type CrudPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  visibleItems: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function CrudPagination({
  currentPage,
  totalPages,
  totalItems,
  visibleItems,
  pageSize,
  onPrevious,
  onNext,
}: CrudPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, startItem + Math.max(visibleItems - 1, 0));

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[rgba(74,52,34,0.08)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Exibindo {startItem} a {endItem} de {totalItems} resultados.
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="data-pill text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <Button variant="outline" size="icon" onClick={onNext} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
