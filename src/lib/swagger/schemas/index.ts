import { authSchemas } from './auth.schema';
import { commonSchemas } from './common.schema';
import { userSchemas } from './user.schema';

export const schemas = {
  ...authSchemas,
  ...commonSchemas,
  ...userSchemas,
};
