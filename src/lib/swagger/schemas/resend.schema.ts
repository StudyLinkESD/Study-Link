export const resendSchemas = {
  SendEmailRequest: {
    type: 'object',
    required: ['to', 'subject', 'html'],
    properties: {
      from: {
        type: 'string',
        format: 'email',
        description: "Adresse email de l'expéditeur",
        example: 'no-reply@studylink.com',
      },
      to: {
        type: 'string',
        format: 'email',
        description: 'Adresse email du destinataire',
        example: 'user@example.com',
      },
      subject: {
        type: 'string',
        description: "Sujet de l'email",
        example: 'Confirmation de votre inscription',
      },
      html: {
        type: 'string',
        description: "Contenu HTML de l'email",
        example:
          '<h1>Bienvenue sur StudyLink !</h1><p>Cliquez sur le lien pour confirmer votre email...</p>',
      },
      url: {
        type: 'string',
        description: 'URL optionnelle à inclure dans la réponse',
        example: 'https://studylink.com/verify-email?token=xyz',
      },
    },
  },
  SendEmailResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: "ID de l'email envoyé",
            example: 'email_123abc',
          },
        },
      },
      url: {
        type: 'string',
        description: 'URL retournée si elle était présente dans la requête',
        example: 'https://studylink.com/verify-email?token=xyz',
      },
    },
  },
  SendEmailError: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: "Message d'erreur",
        example: "L'email du destinataire est requis.",
      },
    },
  },
};
