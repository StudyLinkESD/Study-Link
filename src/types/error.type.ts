export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationErrorResponse = {
  error: string;
  details?: ValidationError[];
};

export type ApiError = {
  error: string;
};
