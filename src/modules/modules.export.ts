import { CompanyModule } from './company/company.module';
import { JobModule } from './job/job.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './userrole/userrole.module';

export const modules = [
  ReviewModule,
  JobModule,
  CompanyModule,
  UserModule,
  UserRoleModule,
];
