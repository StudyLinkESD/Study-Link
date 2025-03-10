export const studentSchemas = {
  StudentResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'étudiant",
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'utilisateur associé",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'école",
      },
      studentEmail: {
        type: 'string',
        format: 'email',
        description: "Email étudiant de l'utilisateur",
      },
      primaryRecommendationId: {
        type: 'string',
        format: 'uuid',
        description: 'Identifiant de la recommandation principale',
        nullable: true,
      },
      status: {
        type: 'string',
        enum: ['Alternant', 'Stagiaire'],
        description: "Statut de l'étudiant",
      },
      skills: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: "Compétences de l'étudiant",
      },
      apprenticeshipRhythm: {
        type: 'string',
        description: "Rythme d'alternance",
      },
      description: {
        type: 'string',
        description: "Description du profil de l'étudiant",
      },
      curriculumVitae: {
        type: 'string',
        description: "URL du CV de l'étudiant",
        nullable: true,
      },
      previousCompanies: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: "Liste des entreprises précédentes de l'étudiant",
      },
      availability: {
        type: 'string',
        description: "Disponibilité de l'étudiant",
      },
      user: {
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
          },
          lastName: {
            type: 'string',
          },
          profilePicture: {
            type: 'string',
            nullable: true,
          },
        },
      },
      school: {
        type: 'object',
        nullable: true,
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
        },
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
      schoolId: '987fcdeb-51a2-4bc1-9e3d-14af6324a000',
      studentEmail: 'john.doe@student.epsi.fr',
      primaryRecommendationId: null,
      status: 'Alternant',
      skills: ['JavaScript', 'React', 'Node.js'],
      apprenticeshipRhythm: '3 semaines entreprise / 1 semaine école',
      description: 'Étudiant passionné par le développement web',
      curriculumVitae: 'https://example.com/cv.pdf',
      previousCompanies: ['Tech Corp', 'Digital Agency'],
      availability: 'Disponible à partir de septembre 2024',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'john.doe@epsi.fr',
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: 'https://example.com/profile.jpg',
      },
      school: {
        id: '987fcdeb-51a2-4bc1-9e3d-14af6324a000',
        name: 'EPSI',
      },
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateStudentDTO: {
    type: 'object',
    required: [
      'userId',
      'schoolId',
      'studentEmail',
      'status',
      'skills',
      'apprenticeshipRhythm',
      'description',
      'previousCompanies',
      'availability',
    ],
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'utilisateur associé",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'école",
      },
      studentEmail: {
        type: 'string',
        format: 'email',
        description: "Email étudiant de l'utilisateur",
      },
      status: {
        type: 'string',
        enum: ['Alternant', 'Stagiaire'],
        description: "Statut de l'étudiant",
      },
      skills: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: "Compétences de l'étudiant",
      },
      apprenticeshipRhythm: {
        type: 'string',
        description: "Rythme d'alternance",
      },
      description: {
        type: 'string',
        description: "Description du profil de l'étudiant",
      },
      curriculumVitae: {
        type: 'string',
        description: "URL du CV de l'étudiant",
        nullable: true,
      },
      previousCompanies: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: "Liste des entreprises précédentes de l'étudiant",
      },
      availability: {
        type: 'string',
        description: "Disponibilité de l'étudiant",
      },
    },
    example: {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      schoolId: '987fcdeb-51a2-4bc1-9e3d-14af6324a000',
      studentEmail: 'john.doe@student.epsi.fr',
      status: 'Alternant',
      skills: ['JavaScript', 'React', 'Node.js'],
      apprenticeshipRhythm: '3 semaines entreprise / 1 semaine école',
      description: 'Étudiant passionné par le développement web',
      curriculumVitae: 'https://example.com/cv.pdf',
      previousCompanies: ['Tech Corp', 'Digital Agency'],
      availability: 'Disponible à partir de septembre 2024',
    },
  },
  StudentError: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Code d'erreur",
      },
      details: {
        type: 'array',
        items: {
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
        },
        description: 'Détails des erreurs de validation',
      },
    },
    example: {
      error: 'Validation failed',
      details: [
        {
          field: 'studentEmail',
          message: 'Email étudiant invalide',
        },
      ],
    },
  },
  StudentJobRequestResponseDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de la demande d'emploi",
      },
      studentId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'étudiant",
      },
      jobId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'offre d'emploi",
      },
      status: {
        type: 'string',
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        description: "Statut de la demande d'emploi",
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Date de création',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Date de dernière modification',
      },
    },
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      studentId: '123e4567-e89b-12d3-a456-426614174000',
      jobId: '987fcdeb-51a2-4bc1-9e3d-14af6324a000',
      status: 'PENDING',
      createdAt: '2024-03-10T12:00:00Z',
      updatedAt: '2024-03-10T12:00:00Z',
    },
  },
  CreateStudentJobRequestDTO: {
    type: 'object',
    required: ['jobId'],
    properties: {
      jobId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'offre d'emploi",
      },
    },
    example: {
      jobId: '987fcdeb-51a2-4bc1-9e3d-14af6324a000',
    },
  },
  UpdateStudentJobRequestDTO: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        description: "Nouveau statut de la demande d'emploi",
      },
      message: {
        type: 'string',
        description: 'Message optionnel accompagnant le changement de statut',
      },
    },
    example: {
      status: 'ACCEPTED',
      message: 'Votre candidature a été acceptée',
    },
  },
  StudentJobRequestError: {
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
        },
        description: 'Détails des erreurs de validation',
      },
    },
    example: {
      error: 'VALIDATION_ERROR',
      message: 'Données invalides',
      details: [
        {
          field: 'status',
          message: 'Le statut doit être PENDING, ACCEPTED ou REJECTED',
        },
      ],
    },
  },
};
