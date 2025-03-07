import { Search, X } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

type SearchBarProps = {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceTime?: number;
  className?: string;
  showClearButton?: boolean;
};

function SearchBar({
  onSearch,
  placeholder = 'Rechercher...',
  initialValue = '',
  debounceTime = 300,
  className = '',
  showClearButton = true,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch, debounceTime]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 pr-8"
        aria-label={placeholder}
      />
      {showClearButton && searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute right-2.5 top-2.5"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
