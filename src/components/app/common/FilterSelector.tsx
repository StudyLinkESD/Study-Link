import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

type Option = {
  value: string;
  label: string;
};

type FilterSelectorProps = {
  options: Option[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
};

function FilterSelector({
  options,
  selectedValues,
  onSelect,
  onRemove,
  placeholder = 'Sélectionner...',
  className = '',
  emptyMessage = 'Aucun filtre sélectionné',
}: FilterSelectorProps) {
  const [selectKey, setSelectKey] = useState(0);

  const availableOptions = options.filter((option) => !selectedValues.includes(option.value));

  const handleValueChange = (value: string) => {
    if (value) {
      onSelect(value);
      setSelectKey((prev) => prev + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2 min-h-[38px] max-h-[76px] overflow-y-auto p-1">
        {selectedValues.length === 0 ? (
          <div className="text-muted-foreground text-sm italic">{emptyMessage}</div>
        ) : (
          selectedValues.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className="px-2 py-1 h-[30px] flex items-center"
              >
                {option?.label || value}
                <button
                  onClick={() => onRemove(value)}
                  className="ml-2 hover:text-destructive"
                  aria-label={`Supprimer le filtre ${option?.label || value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      <Select key={selectKey} onValueChange={handleValueChange} value="">
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Tous les filtres sont sélectionnés
            </div>
          ) : (
            availableOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default FilterSelector;
