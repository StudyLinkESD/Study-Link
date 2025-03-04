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
        <div key={rec.id} className="p-4 bg-muted/40 rounded-lg">
          <p className="italic mb-4">{rec.content}</p>
          <div className="text-sm font-medium">{rec.authorName}</div>
          {rec.authorTitle && (
            <div className="text-xs text-muted-foreground">{rec.authorTitle}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecommendationsList;
