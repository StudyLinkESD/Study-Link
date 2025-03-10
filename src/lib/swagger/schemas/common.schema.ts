export const commonSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Message d'erreur",
      },
    },
    example: {
      error: 'Une erreur est survenue lors du traitement de la requête',
    },
  },
  PaginationParams: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Numéro de la page',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: "Nombre d'éléments par page",
      },
    },
    example: {
      page: 1,
      limit: 10,
    },
  },
};
