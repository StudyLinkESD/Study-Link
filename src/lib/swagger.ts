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
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              firstName: { type: 'string', nullable: true },
              lastName: { type: 'string', nullable: true },
              type: { type: 'string', enum: ['student', 'company-owner', 'school-owner', 'admin'] },
              profilePicture: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time', nullable: true },
            },
          },
          UserWithRelations: {
            allOf: [
              { $ref: '#/components/schemas/User' },
              {
                type: 'object',
                properties: {
                  student: { $ref: '#/components/schemas/StudentRelations' },
                  schoolOwner: { $ref: '#/components/schemas/SchoolOwnerRelations' },
                  companyOwner: { $ref: '#/components/schemas/CompanyOwnerRelations' },
                },
              },
            ],
          },
          StudentRelations: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              schoolId: { type: 'string' },
              status: { type: 'string' },
              skills: { type: 'string' },
              description: { type: 'string' },
              previousCompanies: { type: 'string' },
              availability: { type: 'boolean' },
              school: { $ref: '#/components/schemas/School' },
              jobRequests: {
                type: 'array',
                items: { $ref: '#/components/schemas/JobRequest' },
              },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: {
                type: 'array',
                items: { type: 'object' },
                nullable: true,
              },
            },
          },
        },
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
  });
  return spec;
};
