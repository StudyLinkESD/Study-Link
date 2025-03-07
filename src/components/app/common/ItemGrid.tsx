import { Search } from 'lucide-react';

import React from 'react';

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
  icon = <Search className="text-muted-foreground h-10 w-10" />,
  title = 'Aucun élément trouvé',
  description = 'Aucun élément ne correspond à vos critères de recherche.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
      <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ItemGrid<T>({
  items,
  renderItem,
  keyExtractor,
  emptyState,
  gridClassName = 'grid grid-cols-1 md:gap-6',
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
