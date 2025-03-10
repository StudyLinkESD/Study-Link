export const companyOwnerSchemas = {
  CompanyOwnerResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'utilisateur associé",
      },
      companyId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'entreprise associée",
      },
      user: {
        $ref: '#/components/schemas/UserResponseDTO',
      },
      company: {
        $ref: '#/components/schemas/CompanyResponseDTO',
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
      userId: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '987fcdeb-51d3-a456-b789-426614174000',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'owner@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        type: 'company-owner',
        profilePicture: 'https://example.com/photos/jane.jpg',
        profileCompleted: true,
        emailVerified: true,
        createdAt: '2024-03-10T12:00:00Z',
        updatedAt: '2024-03-10T12:00:00Z',
      },
      company: {
        id: '987fcdeb-51d3-a456-b789-426614174000',
        name: 'Tech Solutions Inc.',
        description: 'Entreprise leader dans le développement de solutions innovantes',
        logo: 'https://example.com/logos/techsolutions.png',
        website: 'https://techsolutions.com',
        location: 'Paris, France',
        createdAt: '2024-03-10T12:00:00Z',
        updatedAt: '2024-03-10T12:00:00Z',
      },
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateCompanyOwnerRequest: {
    type: 'object',
    required: ['userId', 'companyId'],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'utilisateur à associer",
      },
      companyId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'entreprise à associer",
      },
    },
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '987fcdeb-51d3-a456-b789-426614174000',
    },
  },
  CompanyOwnersListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CompanyOwnerResponseDTO',
        },
      },
      total: {
        type: 'integer',
        description: "Nombre total de propriétaires d'entreprise",
      },
    },
    example: {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          companyId: '987fcdeb-51d3-a456-b789-426614174000',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'owner@company.com',
            firstName: 'Jane',
            lastName: 'Smith',
            type: 'company-owner',
            profilePicture: 'https://example.com/photos/jane.jpg',
            profileCompleted: true,
            emailVerified: true,
            createdAt: '2024-03-10T12:00:00Z',
            updatedAt: '2024-03-10T12:00:00Z',
          },
          company: {
            id: '987fcdeb-51d3-a456-b789-426614174000',
            name: 'Tech Solutions Inc.',
            logo: 'https://example.com/logos/techsolutions.png',
          },
          createdAt: '2024-03-10T12:00:00Z',
          updatedAt: '2024-03-10T12:00:00Z',
        },
      ],
      total: 1,
    },
  },
};
