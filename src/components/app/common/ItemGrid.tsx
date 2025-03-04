import React from 'react';
import { Search } from 'lucide-react';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
};

type ItemGridProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyState?: EmptyStateProps;
  gridClassName?: string;
  itemClassName?: string;
};

function EmptyState({
  icon = <Search className="h-10 w-10 text-muted-foreground" />,
  title = 'Aucun élément trouvé',
  description = 'Aucun élément ne correspond à vos critères de recherche.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ItemGrid<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  itemClassName = '',
}: ItemGridProps<T>) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyState?.icon}
        title={emptyState?.title}
        description={emptyState?.description}
      />
    );
  }

  return (
    <div className={gridClassName} role="list">
      {items.map((item, index) => (
        <div key={keyExtractor(item)} role="listitem" className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default ItemGrid;
export { EmptyState };
