import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobCategoryController } from './controllers/job-category.controller';
import { JobController } from './controllers/job.controller';
import { JobCategory } from './entities/job-category.entity';
import { Job } from './entities/job.entity';
import { JobCategoryService } from './services/job-category.service';
import { JobService } from './services/job.service';
@Module({
  imports: [TypeOrmModule.forFeature([Job, JobCategory])],
  controllers: [JobController, JobCategoryController],
  providers: [JobService, JobCategoryService],
})
export class JobModule {}
