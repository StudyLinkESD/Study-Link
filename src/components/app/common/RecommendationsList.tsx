import { FC } from 'react';

type Recommendation = {
  id: string;
  authorName: string;
  authorTitle?: string;
  content: string;
};

type RecommendationsListProps = {
  recommendations: Recommendation[];
  emptyMessage?: string;
  className?: string;
};

const RecommendationsList: FC<RecommendationsListProps> = ({
  recommendations,
  emptyMessage = 'Aucune recommandation disponible.',
  className = '',
}) => {
  if (!recommendations || recommendations.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {recommendations.map((rec) => (
        <div key={rec.id} className="bg-muted/40 rounded-lg p-4">
          <p className="mb-4 italic">{rec.content}</p>
          <div className="text-sm font-medium">{rec.authorName}</div>
          {rec.authorTitle && (
            <div className="text-muted-foreground text-xs">{rec.authorTitle}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecommendationsList;
