export const userSchemas = {
  UserType: {
    type: 'string',
    enum: ['student', 'company-owner', 'school-owner', 'admin'],
    example: 'student',
  },
  UserResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      firstName: {
        type: 'string',
        nullable: true,
      },
      lastName: {
        type: 'string',
        nullable: true,
      },
      type: {
        $ref: '#/components/schemas/UserType',
      },
      profilePicture: {
        type: 'string',
        nullable: true,
      },
      profileCompleted: {
        type: 'boolean',
      },
      emailVerified: {
        type: 'boolean',
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
      email: 'john.doe@student-domain.com',
      firstName: 'John',
      lastName: 'Doe',
      type: 'student',
      profilePicture: 'https://example.com/photos/john-doe.jpg',
      profileCompleted: true,
      emailVerified: true,
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateUserRequest: {
    type: 'object',
    required: ['email', 'type'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: "Adresse email de l'utilisateur",
      },
      firstName: {
        type: 'string',
        description: "Prénom de l'utilisateur",
      },
      lastName: {
        type: 'string',
        description: "Nom de l'utilisateur",
      },
      type: {
        $ref: '#/components/schemas/UserType',
      },
      profilePicture: {
        type: 'string',
        description: 'URL de la photo de profil',
      },
      profileCompleted: {
        type: 'boolean',
        description: 'Indique si le profil est complété',
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'école (requis pour les étudiants et propriétaires d'école)",
      },
      companyId: {
        type: 'string',
        format: 'uuid',
        description: "ID de l'entreprise (requis pour les propriétaires d'entreprise)",
      },
      studentEmail: {
        type: 'string',
        format: 'email',
        description: 'Email étudiant (requis pour les étudiants)',
      },
    },
    examples: {
      student: {
        email: 'john.doe@school-domain.com',
        firstName: 'John',
        lastName: 'Doe',
        type: 'student',
        schoolId: '123e4567-e89b-12d3-a456-426614174000',
        studentEmail: 'john.doe@student-mail.com',
        profileCompleted: false,
      },
      companyOwner: {
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        type: 'company-owner',
        companyId: '123e4567-e89b-12d3-a456-426614174001',
        profileCompleted: false,
      },
    },
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        description: "Prénom de l'utilisateur",
      },
      lastName: {
        type: 'string',
        description: "Nom de l'utilisateur",
      },
      profilePicture: {
        type: 'string',
        description: 'URL de la photo de profil',
      },
      profileCompleted: {
        type: 'boolean',
        description: 'Indique si le profil est complété',
      },
    },
    example: {
      firstName: 'John',
      lastName: 'Doe',
      profilePicture: 'https://example.com/photos/john-doe-updated.jpg',
      profileCompleted: true,
    },
  },
  UsersListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UserResponseDTO',
        },
      },
      total: {
        type: 'integer',
        description: "Nombre total d'utilisateurs",
      },
    },
    example: {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'student@school.com',
          firstName: 'John',
          lastName: 'Doe',
          type: 'student',
          profilePicture: 'https://example.com/photos/john.jpg',
          profileCompleted: true,
          emailVerified: true,
          createdAt: '2024-03-10T12:00:00Z',
          updatedAt: '2024-03-10T12:00:00Z',
        },
      ],
      total: 1,
    },
  },
};
