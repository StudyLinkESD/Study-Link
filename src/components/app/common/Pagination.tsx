import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number; // Limite le nombre de boutons de page affichés
  showFirstLastButtons?: boolean; // Option pour afficher les boutons "Premier" et "Dernier"
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
  }; // Personnalisation des libellés pour l'internationalisation
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
  // Logique pour déterminer quelles pages afficher lorsque maxPageButtons est inférieur à totalPages
  const getPageRange = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calcul pour afficher les boutons de page autour de la page courante
    const halfMax = Math.floor(maxPageButtons / 2);
    let start = Math.max(currentPage - halfMax, 1);
    let end = Math.min(start + maxPageButtons - 1, totalPages);

    if (end - start + 1 < maxPageButtons) {
      start = Math.max(end - maxPageButtons + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageButtons = getPageRange();

  return (
    <nav className="flex justify-center mt-6" aria-label="Pagination">
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
          <ChevronLeft className="h-4 w-4 mr-1" />
          {labels.previous}
        </Button>

        <div className="flex items-center space-x-1">
          {pageButtons.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
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
          <ChevronRight className="h-4 w-4 ml-1" />
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
