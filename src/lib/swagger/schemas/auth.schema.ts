export const authSchemas = {
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
    example: {
      email: 'john.doe@student-domain.com',
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
    example: {
      message: 'Un email de connexion a été envoyé',
      isNewUser: true,
    },
  },
};
