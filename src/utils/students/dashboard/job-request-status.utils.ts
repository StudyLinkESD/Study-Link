export type JobRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type JobRequestStatusLabels = {
  [key in JobRequestStatus]: string;
};

export const JOB_REQUEST_STATUS_LABELS: JobRequestStatusLabels = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Rejetée',
};

export const getStatusLabel = (status: JobRequestStatus | string): string => {
  return JOB_REQUEST_STATUS_LABELS[status as JobRequestStatus] || status;
};

export const getStatusVariant = (
  status: JobRequestStatus | string,
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
