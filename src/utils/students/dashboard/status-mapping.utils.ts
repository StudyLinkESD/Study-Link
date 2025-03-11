export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type RequestStatusLabels = {
  [key in RequestStatus]: string;
};

export const REQUEST_STATUS_LABELS: RequestStatusLabels = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Rejetée',
};

export const getStatusLabel = (status: RequestStatus | string): string => {
  return REQUEST_STATUS_LABELS[status as RequestStatus] || status;
};

export const getStatusVariant = (
  status: RequestStatus | string,
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
