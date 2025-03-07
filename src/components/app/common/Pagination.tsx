import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
  showFirstLastButtons?: boolean;
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
  };
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPageButtons = 5,
  showFirstLastButtons = false,
  labels = {
    previous: 'Précédent',
    next: 'Suivant',
    first: 'Premier',
    last: 'Dernier',
  },
}: PaginationProps) {
  const getPageRange = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfMax = Math.floor(maxPageButtons / 2);
    let start = Math.max(currentPage - halfMax, 1);
    const end = Math.min(start + maxPageButtons - 1, totalPages);

    if (end - start + 1 < maxPageButtons) {
      start = Math.max(end - maxPageButtons + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageButtons = getPageRange();

  return (
    <nav className="mt-6 flex justify-center" aria-label="Pagination">
      <div className="flex items-center space-x-2">
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label={labels.first}
          >
            {labels.first}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          aria-label={labels.previous}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {labels.previous}
        </Button>

        <div className="flex items-center space-x-1">
          {pageButtons.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 p-0"
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label={labels.next}
        >
          {labels.next}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

        {showFirstLastButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label={labels.last}
          >
            {labels.last}
          </Button>
        )}
      </div>
    </nav>
  );
}

export default Pagination;
