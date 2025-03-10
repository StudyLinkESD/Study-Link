export const jobRequestSchemas = {
  JobRequestStatus: {
    type: 'string',
    enum: ['pending', 'accepted', 'rejected'],
    example: 'pending',
  },
  JobRequestResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      studentId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'étudiant",
      },
      jobId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'offre d'emploi",
      },
      status: {
        $ref: '#/components/schemas/JobRequestStatus',
      },
      message: {
        type: 'string',
        description: 'Message de candidature',
        nullable: true,
      },
      student: {
        $ref: '#/components/schemas/UserResponseDTO',
      },
      job: {
        $ref: '#/components/schemas/JobResponseDTO',
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
      studentId: '123e4567-e89b-12d3-a456-426614174000',
      jobId: '987fcdeb-51d3-a456-b789-426614174000',
      status: 'pending',
      message: 'Je suis très intéressé par cette opportunité...',
      student: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'student@school.com',
        firstName: 'John',
        lastName: 'Doe',
        type: 'student',
        profileCompleted: true,
        emailVerified: true,
        createdAt: '2024-03-10T12:00:00Z',
        updatedAt: '2024-03-10T12:00:00Z',
      },
      job: {
        id: '987fcdeb-51d3-a456-b789-426614174000',
        title: 'Développeur Full Stack',
        company: {
          id: '456e8400-e29b-41d4-a716-446655440000',
          name: 'Tech Solutions Inc.',
          logo: 'https://example.com/logos/techsolutions.png',
        },
      },
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
      deletedAt: null,
    },
  },
  CreateJobRequestRequest: {
    type: 'object',
    required: ['studentId', 'jobId'],
    properties: {
      studentId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'étudiant",
      },
      jobId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'offre d'emploi",
      },
      message: {
        type: 'string',
        description: 'Message de candidature',
      },
    },
    example: {
      studentId: '123e4567-e89b-12d3-a456-426614174000',
      jobId: '987fcdeb-51d3-a456-b789-426614174000',
      message: 'Je suis très intéressé par cette opportunité...',
    },
  },
  UpdateJobRequestRequest: {
    type: 'object',
    properties: {
      status: {
        $ref: '#/components/schemas/JobRequestStatus',
      },
      message: {
        type: 'string',
        description: 'Message de candidature',
      },
    },
    example: {
      status: 'accepted',
      message: 'Votre candidature a été acceptée',
    },
  },
  JobRequestsListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/JobRequestResponseDTO',
        },
      },
      total: {
        type: 'integer',
        description: "Nombre total de demandes d'emploi",
      },
    },
    example: {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          studentId: '123e4567-e89b-12d3-a456-426614174000',
          jobId: '987fcdeb-51d3-a456-b789-426614174000',
          status: 'pending',
          message: 'Je suis très intéressé par cette opportunité...',
          student: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'student@school.com',
            firstName: 'John',
            lastName: 'Doe',
            type: 'student',
          },
          job: {
            id: '987fcdeb-51d3-a456-b789-426614174000',
            title: 'Développeur Full Stack',
            company: {
              name: 'Tech Solutions Inc.',
              logo: 'https://example.com/logos/techsolutions.png',
            },
          },
          createdAt: '2024-03-10T12:00:00Z',
          updatedAt: '2024-03-10T12:00:00Z',
          deletedAt: null,
        },
      ],
      total: 1,
    },
  },
};
