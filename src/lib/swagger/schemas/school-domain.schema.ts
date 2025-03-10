export const schoolDomainSchemas = {
  SchoolDomainResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      domain: {
        type: 'string',
        description: "Nom de domaine de l'école",
        example: 'epsi.fr',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  CreateSchoolDomainRequest: {
    type: 'object',
    required: ['domain'],
    properties: {
      domain: {
        type: 'string',
        description: "Nom de domaine de l'école",
        example: 'epsi.fr',
      },
    },
  },
  UpdateSchoolDomainRequest: {
    type: 'object',
    required: ['domain'],
    properties: {
      domain: {
        type: 'string',
        description: "Nouveau nom de domaine de l'école",
        example: 'epsi.fr',
      },
    },
  },
  CheckDomainRequest: {
    type: 'object',
    required: ['domain'],
    properties: {
      domain: {
        type: 'string',
        description: 'Nom de domaine à vérifier',
        example: 'epsi.fr',
      },
    },
  },
  CheckDomainResponse: {
    type: 'object',
    properties: {
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'école associée au domaine",
      },
      schoolName: {
        type: 'string',
        description: "Nom de l'école associée au domaine",
      },
    },
    example: {
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      schoolName: 'EPSI',
    },
  },
  SchoolDomainError: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Message d'erreur",
      },
      details: {
        type: 'object',
        description: "Détails de l'erreur",
        additionalProperties: {
          type: 'string',
        },
      },
      code: {
        type: 'string',
        description: "Code d'erreur",
      },
    },
    example: {
      error: 'Le domaine est déjà utilisé',
      details: {
        domain: 'Ce domaine existe déjà',
      },
      code: 'DOMAIN_EXISTS',
    },
  },
};
