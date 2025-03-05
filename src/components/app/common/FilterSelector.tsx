import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterSelectorProps = {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  showResetButton?: boolean;
};

function FilterSelector({
  options,
  selectedValues,
  onSelect,
  onRemove,
  onReset,
  placeholder = 'Filtres',
  className = '',
  showResetButton = false,
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 min-h-[38px] max-h-[76px] overflow-y-auto p-1">
          {selectedValues.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">Aucun filtre sélectionné</div>
          ) : (
            selectedValues.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="px-2 py-1 h-[30px] flex items-center"
              >
                {value}
                <button
                  onClick={() => onRemove(value)}
                  className="ml-2 hover:text-destructive"
                  aria-label={`Supprimer le filtre ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-row items-center gap-4">
        <Select key={selectKey} onValueChange={handleValueChange} value="">
          <SelectTrigger className="w-full sm:w-[210px]">
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

        {showResetButton && selectedValues.length > 0 && onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            aria-label="Réinitialiser les filtres"
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterSelector;
