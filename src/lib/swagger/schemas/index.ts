import { authSchemas } from './auth.schema';
import { commonSchemas } from './common.schema';
import { companySchemas } from './company.schema';
import { userSchemas } from './user.schema';

export const schemas = {
  ...authSchemas,
  ...commonSchemas,
  ...companySchemas,
  ...userSchemas,
};
