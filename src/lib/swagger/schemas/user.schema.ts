export const userSchemas = {
  UserType: {
    type: 'string',
    enum: ['student', 'company-owner', 'school-owner', 'admin'],
    description: "Type d'utilisateur",
    example: 'student',
  },
  ValidationError: {
    type: 'object',
    properties: {
      field: {
        type: 'string',
        description: 'Champ en erreur',
      },
      message: {
        type: 'string',
        description: "Message d'erreur",
      },
    },
    example: {
      field: 'email',
      message: 'Email invalide',
    },
  },
  UserResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'utilisateur",
      },
      email: {
        type: 'string',
        format: 'email',
        description: "Adresse email de l'utilisateur",
      },
      firstName: {
        type: 'string',
        nullable: true,
        description: "Prénom de l'utilisateur",
      },
      lastName: {
        type: 'string',
        nullable: true,
        description: "Nom de l'utilisateur",
      },
      type: {
        $ref: '#/components/schemas/UserType',
        description: "Type d'utilisateur",
      },
      profilePicture: {
        type: 'string',
        nullable: true,
        description: "URL de la photo de profil de l'utilisateur",
      },
      profileCompleted: {
        type: 'boolean',
        description: "Indique si le profil de l'utilisateur est complété",
      },
      emailVerified: {
        type: 'boolean',
        description: "Indique si l'email de l'utilisateur est vérifié",
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: "Date de création de l'utilisateur",
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: "Date de dernière modification de l'utilisateur",
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
        value: {
          email: 'john.doe@school-domain.com',
          firstName: 'John',
          lastName: 'Doe',
          type: 'student',
          schoolId: '123e4567-e89b-12d3-a456-426614174000',
          studentEmail: 'john.doe@student-mail.com',
          profileCompleted: false,
        },
        summary: "Exemple de création d'un étudiant",
      },
      companyOwner: {
        value: {
          email: 'jane.smith@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          type: 'company-owner',
          companyId: '123e4567-e89b-12d3-a456-426614174001',
          profileCompleted: false,
        },
        summary: "Exemple de création d'un propriétaire d'entreprise",
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
        description: 'Liste des utilisateurs',
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
  UserError: {
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
        type: 'array',
        items: {
          $ref: '#/components/schemas/ValidationError',
        },
        description: 'Détails des erreurs de validation',
      },
    },
    example: {
      error: 'VALIDATION_ERROR',
      message: 'Données invalides',
      details: [
        {
          field: 'email',
          message: 'Email invalide',
        },
      ],
    },
  },
};
