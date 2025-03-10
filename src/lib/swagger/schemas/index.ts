import { authSchemas } from './auth.schema';
import { commonSchemas } from './common.schema';
import { companyOwnerSchemas } from './company-owner.schema';
import { companySchemas } from './company.schema';
import { jobRequestSchemas } from './job-request.schema';
import { jobSchemas } from './job.schema';
import { resendSchemas } from './resend.schema';
import { schoolDomainSchemas } from './school-domain.schema';
import { schoolOwnerSchemas } from './school-owner.schema';
import { userSchemas } from './user.schema';

export const schemas = {
  ...authSchemas,
  ...commonSchemas,
  ...companyOwnerSchemas,
  ...companySchemas,
  ...jobRequestSchemas,
  ...jobSchemas,
  ...resendSchemas,
  ...schoolDomainSchemas,
  ...schoolOwnerSchemas,
  ...userSchemas,
};
