export const companySchemas = {
  CompanyResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
        description: "Nom de l'entreprise",
      },
      description: {
        type: 'string',
        description: "Description de l'entreprise",
        nullable: true,
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'entreprise",
        nullable: true,
      },
      website: {
        type: 'string',
        description: "Site web de l'entreprise",
        nullable: true,
      },
      location: {
        type: 'string',
        description: "Localisation de l'entreprise",
        nullable: true,
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
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tech Solutions Inc.',
      description: 'Entreprise leader dans le développement de solutions innovantes',
      logo: 'https://example.com/logos/techsolutions.png',
      website: 'https://techsolutions.com',
      location: 'Paris, France',
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateCompanyRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        description: "Nom de l'entreprise",
      },
      description: {
        type: 'string',
        description: "Description de l'entreprise",
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'entreprise",
      },
      website: {
        type: 'string',
        description: "Site web de l'entreprise",
      },
      location: {
        type: 'string',
        description: "Localisation de l'entreprise",
      },
    },
    example: {
      name: 'Tech Solutions Inc.',
      description: 'Entreprise leader dans le développement de solutions innovantes',
      logo: 'https://example.com/logos/techsolutions.png',
      website: 'https://techsolutions.com',
      location: 'Paris, France',
    },
  },
  UpdateCompanyRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: "Nom de l'entreprise",
      },
      description: {
        type: 'string',
        description: "Description de l'entreprise",
      },
      logo: {
        type: 'string',
        description: "URL du logo de l'entreprise",
      },
      website: {
        type: 'string',
        description: "Site web de l'entreprise",
      },
      location: {
        type: 'string',
        description: "Localisation de l'entreprise",
      },
    },
    example: {
      name: 'Tech Solutions International',
      description: 'Leader mondial dans le développement de solutions innovantes',
      logo: 'https://example.com/logos/techsolutions-new.png',
      website: 'https://techsolutions.com',
      location: 'Paris & Lyon, France',
    },
  },
  CompaniesListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CompanyResponseDTO',
        },
      },
      total: {
        type: 'integer',
        description: "Nombre total d'entreprises",
      },
    },
    example: {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Tech Solutions Inc.',
          description: 'Entreprise leader dans le développement de solutions innovantes',
          logo: 'https://example.com/logos/techsolutions.png',
          website: 'https://techsolutions.com',
          location: 'Paris, France',
          createdAt: '2024-03-10T12:00:00Z',
          updatedAt: '2024-03-10T12:00:00Z',
        },
      ],
      total: 1,
    },
  },
};
