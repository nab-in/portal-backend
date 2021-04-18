import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { JobModule } from './job/job.module';
import { ReviewModule } from './review/review.module';

export const modules = [ReviewModule, JobModule, CompanyModule, AuthModule];
