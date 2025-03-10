export const schoolSchemas = {
  SchoolResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
        description: "Nom de l'école",
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'école",
        nullable: true,
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        description: "ID du domaine de l'école",
      },
      domain: {
        $ref: '#/components/schemas/SchoolDomainResponseDTO',
      },
      isActive: {
        type: 'boolean',
        description: "État d'activation de l'école",
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
      deletedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
    },
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'EPSI',
      logo: 'https://example.com/logo.png',
      domainId: '123e4567-e89b-12d3-a456-426614174000',
      domain: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        domain: 'epsi.fr',
      },
      isActive: true,
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
      deletedAt: null,
    },
  },
  CreateSchoolRequest: {
    type: 'object',
    required: ['name', 'domainId', 'owner'],
    properties: {
      name: {
        type: 'string',
        description: "Nom de l'école",
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        description: "ID du domaine autorisé de l'école",
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'école",
      },
      owner: {
        type: 'object',
        required: ['email'],
        properties: {
          firstName: {
            type: 'string',
            nullable: true,
            description: 'Prénom du propriétaire',
          },
          lastName: {
            type: 'string',
            nullable: true,
            description: 'Nom du propriétaire',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email du propriétaire',
          },
        },
      },
    },
    example: {
      name: 'EPSI',
      domainId: '123e4567-e89b-12d3-a456-426614174000',
      logo: 'https://example.com/logo.png',
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@epsi.fr',
      },
    },
  },
  CreateSchoolWithDomainRequest: {
    type: 'object',
    required: ['school', 'domain', 'owner'],
    properties: {
      school: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: "Nom de l'école",
          },
          logo: {
            type: 'string',
            description: "URL du logo de l'école",
          },
        },
      },
      domain: {
        type: 'string',
        description: "Domaine de l'école (ex: epsi.fr)",
      },
      owner: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: {
            type: 'string',
            description: 'Prénom du propriétaire',
          },
          lastName: {
            type: 'string',
            description: 'Nom du propriétaire',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email du propriétaire',
          },
        },
      },
    },
    example: {
      school: {
        name: 'EPSI',
        logo: 'https://example.com/logo.png',
      },
      domain: 'epsi.fr',
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@epsi.fr',
      },
    },
  },
  CreateSchoolWithDomainResponse: {
    type: 'object',
    properties: {
      school: {
        $ref: '#/components/schemas/SchoolResponseDTO',
      },
      domain: {
        $ref: '#/components/schemas/SchoolDomainResponseDTO',
      },
    },
  },
  CreateSchoolWithDomainError: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Code d'erreur",
        enum: ['USER_EXISTS', 'DOMAIN_EXISTS', 'UNIQUE_CONSTRAINT_FAILED', 'CREATION_FAILED'],
      },
      message: {
        type: 'string',
        description: "Message d'erreur",
      },
      details: {
        type: 'object',
        description: "Détails supplémentaires de l'erreur",
      },
    },
    example: {
      error: 'DOMAIN_EXISTS',
      message: 'Ce domaine est déjà utilisé',
    },
  },
  UpdateSchoolRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: "Nom de l'école",
      },
      domainId: {
        type: 'string',
        format: 'uuid',
        description: "ID du domaine de l'école",
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'école",
        nullable: true,
      },
    },
    example: {
      name: 'EPSI Lyon',
      domainId: '123e4567-e89b-12d3-a456-426614174000',
      logo: 'https://example.com/new-logo.png',
    },
  },
  SchoolError: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Code d'erreur",
      },
      message: {
        type: 'string',
        description: "Message d'erreur",
      },
      details: {
        type: 'object',
        description: "Détails de l'erreur",
        additionalProperties: true,
      },
    },
    example: {
      error: 'DOMAIN_EXISTS',
      message: 'Ce domaine est déjà utilisé',
      details: {
        domain: 'Ce domaine existe déjà',
      },
    },
  },
};
