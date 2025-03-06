export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type ApplicationStatusLabels = {
  [key in ApplicationStatus]: string;
};

export const APPLICATION_STATUS_LABELS: ApplicationStatusLabels = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Rejetée',
};

/**
 * Convertit un statut de l'API en libellé traduit pour l'affichage
 */
export const getStatusLabel = (status: ApplicationStatus | string): string => {
  return APPLICATION_STATUS_LABELS[status as ApplicationStatus] || status;
};

/**
 * Détermine la variante de style à utiliser pour un statut donné
 */
export const getStatusVariant = (
  status: ApplicationStatus | string,
): 'success' | 'destructive' | 'default' => {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'default';
  }
};
