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
  BaseUserResponseDTO: {
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
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: "Date de vérification de l'email",
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
  },
  SchoolDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'école",
      },
      name: {
        type: 'string',
        description: "Nom de l'école",
      },
      logo: {
        type: 'string',
        nullable: true,
        description: "URL du logo de l'école",
      },
      domain: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          domain: {
            type: 'string',
          },
        },
      },
    },
  },
  CompanyDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'entreprise",
      },
      name: {
        type: 'string',
        description: "Nom de l'entreprise",
      },
      logo: {
        type: 'string',
        nullable: true,
        description: "URL du logo de l'entreprise",
      },
    },
  },
  JobRequestDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de la demande d'emploi",
      },
      status: {
        type: 'string',
        description: "Statut de la demande d'emploi",
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Date de création de la demande',
      },
      job: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          company: {
            $ref: '#/components/schemas/CompanyDTO',
          },
        },
      },
    },
  },
  StudentDetailsDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'étudiant",
      },
      schoolId: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant de l'école",
      },
      status: {
        type: 'string',
        description: "Statut de l'étudiant",
      },
      skills: {
        type: 'string',
        description: "Compétences de l'étudiant",
      },
      apprenticeshipRhythm: {
        type: 'string',
        nullable: true,
        description: "Rythme d'alternance",
      },
      description: {
        type: 'string',
        description: 'Description du profil',
      },
      curriculumVitae: {
        type: 'string',
        nullable: true,
        description: 'URL du CV',
      },
      previousCompanies: {
        type: 'string',
        description: 'Entreprises précédentes',
      },
      availability: {
        type: 'boolean',
        description: "Disponibilité de l'étudiant",
      },
      school: {
        $ref: '#/components/schemas/SchoolDTO',
      },
      jobRequests: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/JobRequestDTO',
        },
      },
    },
  },
  CompanyOwnerDetailsDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique du propriétaire d'entreprise",
      },
      company: {
        allOf: [
          { $ref: '#/components/schemas/CompanyDTO' },
          {
            type: 'object',
            properties: {
              jobs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    name: {
                      type: 'string',
                    },
                    status: {
                      type: 'string',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
  },
  SchoolOwnerDetailsDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique du propriétaire d'école",
      },
      school: {
        $ref: '#/components/schemas/SchoolDTO',
      },
    },
  },
  AdminDetailsDTO: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: "Identifiant unique de l'administrateur",
      },
    },
  },
  EnrichedUserResponseDTO: {
    allOf: [
      { $ref: '#/components/schemas/BaseUserResponseDTO' },
      {
        type: 'object',
        properties: {
          student: {
            nullable: true,
            $ref: '#/components/schemas/StudentDetailsDTO',
          },
          companyOwner: {
            nullable: true,
            $ref: '#/components/schemas/CompanyOwnerDetailsDTO',
          },
          schoolOwner: {
            nullable: true,
            $ref: '#/components/schemas/SchoolOwnerDetailsDTO',
          },
          admin: {
            nullable: true,
            $ref: '#/components/schemas/AdminDetailsDTO',
          },
        },
      },
    ],
  },
  CreateUserDTO: {
    type: 'object',
    required: ['email', 'type'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: "Email de l'utilisateur",
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
      },
      profilePicture: {
        type: 'string',
        nullable: true,
        description: 'URL de la photo de profil',
      },
      profileCompleted: {
        type: 'boolean',
        description: 'Indique si le profil est complété',
      },
    },
  },
  UpdateUserDTO: {
    type: 'object',
    properties: {
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
      profilePicture: {
        type: 'string',
        nullable: true,
        description: 'URL de la photo de profil',
      },
      profileCompleted: {
        type: 'boolean',
        description: 'Indique si le profil est complété',
      },
    },
  },
  PaginatedUserResponseDTO: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/EnrichedUserResponseDTO',
        },
      },
      pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'number',
            description: "Nombre total d'éléments",
          },
          page: {
            type: 'number',
            description: 'Page actuelle',
          },
          limit: {
            type: 'number',
            description: "Nombre d'éléments par page",
          },
          totalPages: {
            type: 'number',
            description: 'Nombre total de pages',
          },
        },
      },
    },
  },
};
