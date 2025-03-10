export const schoolOwnerSchemas = {
  SchoolOwnerResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'utilisateur",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'école",
      },
      user: {
        $ref: '#/components/schemas/UserResponseDTO',
      },
      school: {
        $ref: '#/components/schemas/SchoolResponseDTO',
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
      schoolId: '987fcdeb-51d3-a456-b789-426614174000',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'owner@school.com',
        firstName: 'John',
        lastName: 'Doe',
        type: 'school_owner',
      },
      school: {
        id: '987fcdeb-51d3-a456-b789-426614174000',
        name: 'EPSI',
        logo: 'https://example.com/logo.png',
      },
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateSchoolOwnerRequest: {
    type: 'object',
    required: ['userId', 'schoolId'],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'utilisateur à associer comme propriétaire",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'école à associer",
      },
    },
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      schoolId: '987fcdeb-51d3-a456-b789-426614174000',
    },
  },
  UpdateSchoolOwnerRequest: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: "Nouvel ID de l'utilisateur",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "Nouvel ID de l'école",
      },
    },
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      schoolId: '987fcdeb-51d3-a456-b789-426614174000',
    },
  },
  SchoolOwnerError: {
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
    },
    example: {
      error: "L'utilisateur est déjà propriétaire d'une école",
      details: {
        userId: "L'utilisateur est déjà propriétaire d'une école",
      },
    },
  },
};
