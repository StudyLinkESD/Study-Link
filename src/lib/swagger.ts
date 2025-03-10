import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Study Link API Documentation',
        version: '1.0.0',
        description: "Documentation de l'API Study Link",
      },
      servers: [
        {
          url: '/',
          description: 'API Server',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          UserType: {
            type: 'string',
            enum: ['student', 'company-owner', 'school-owner', 'admin'],
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
          },
          AuthenticateRequest: {
            type: 'object',
            required: ['email'],
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: "Adresse email de l'utilisateur",
              },
            },
          },
          AuthenticateResponse: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Message de confirmation',
              },
              isNewUser: {
                type: 'boolean',
                description: "Indique si l'utilisateur vient d'être créé",
              },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: "Message d'erreur",
              },
            },
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });
  return spec;
};
