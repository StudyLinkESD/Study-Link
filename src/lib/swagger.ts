import { createSwaggerSpec } from 'next-swagger-doc';

import { swaggerConfig } from './swagger/config';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: swaggerConfig,
  });
  return spec;
};
