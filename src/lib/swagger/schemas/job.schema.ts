export const jobSchemas = {
  JobType: {
    type: 'string',
    enum: ['CDI', 'CDD', 'STAGE', 'ALTERNANCE'],
    example: 'CDI',
  },
  JobResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      companyId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'entreprise",
      },
      name: {
        type: 'string',
        description: "Titre de l'offre d'emploi",
      },
      featuredImage: {
        type: 'string',
        description: "URL de l'image mise en avant",
        nullable: true,
      },
      description: {
        type: 'string',
        description: "Description détaillée de l'offre",
      },
      skills: {
        type: 'string',
        description: 'Compétences requises (séparées par des virgules)',
        nullable: true,
      },
      type: {
        $ref: '#/components/schemas/JobType',
      },
      availability: {
        type: 'string',
        description: 'Disponibilité requise',
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
      deletedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
    },
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Développeur Full Stack',
      featuredImage: 'https://example.com/images/job.jpg',
      description: 'Nous recherchons un développeur Full Stack expérimenté...',
      skills: 'JavaScript, TypeScript, React, Node.js',
      type: 'CDI',
      availability: 'Immédiate',
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
      deletedAt: null,
    },
  },
  CreateJobRequest: {
    type: 'object',
    required: ['companyId', 'name', 'description', 'type'],
    properties: {
      companyId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'entreprise",
      },
      name: {
        type: 'string',
        description: "Titre de l'offre d'emploi",
      },
      featuredImage: {
        type: 'string',
        description: "URL de l'image mise en avant",
      },
      description: {
        type: 'string',
        description: "Description détaillée de l'offre",
      },
      skills: {
        type: 'string',
        description: 'Compétences requises (séparées par des virgules)',
      },
      type: {
        $ref: '#/components/schemas/JobType',
      },
      availability: {
        type: 'string',
        description: 'Disponibilité requise',
      },
    },
    example: {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Développeur Full Stack',
      featuredImage: 'https://example.com/images/job.jpg',
      description: 'Nous recherchons un développeur Full Stack expérimenté...',
      skills: 'JavaScript, TypeScript, React, Node.js',
      type: 'CDI',
      availability: 'Immédiate',
    },
  },
  UpdateJobRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: "Titre de l'offre d'emploi",
      },
      featuredImage: {
        type: 'string',
        description: "URL de l'image mise en avant",
      },
      description: {
        type: 'string',
        description: "Description détaillée de l'offre",
      },
      skills: {
        type: 'string',
        description: 'Compétences requises (séparées par des virgules)',
      },
      type: {
        $ref: '#/components/schemas/JobType',
      },
      availability: {
        type: 'string',
        description: 'Disponibilité requise',
      },
    },
    example: {
      name: 'Développeur Full Stack Senior',
      description: 'Nous recherchons un développeur Full Stack expérimenté...',
      skills: 'JavaScript, TypeScript, React, Node.js, AWS',
      type: 'CDI',
      availability: 'Dans 2 mois',
    },
  },
  JobsListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            offerTitle: {
              type: 'string',
            },
            companyName: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            logoUrl: {
              type: 'string',
            },
            status: {
              type: 'string',
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
            availability: {
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    },
    example: {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          offerTitle: 'Développeur Full Stack',
          companyName: 'Tech Solutions Inc.',
          description: 'Nous recherchons un développeur Full Stack expérimenté...',
          logoUrl: 'https://example.com/logos/techsolutions.png',
          status: 'CDI',
          skills: [
            {
              id: 'javascript',
              name: 'JavaScript',
            },
            {
              id: 'typescript',
              name: 'TypeScript',
            },
          ],
          availability: 'Immédiate',
        },
      ],
    },
  },
};
