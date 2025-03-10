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
};
