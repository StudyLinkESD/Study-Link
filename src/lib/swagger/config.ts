import { schemas } from './schemas';

export const swaggerConfig = {
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
    schemas,
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};
