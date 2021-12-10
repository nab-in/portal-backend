import { Controller } from '@nestjs/common';
import { BaseController } from 'src/core/controllers/base.controller';
import { JobCategory } from '../entities/job-category.entity';
import { JobCategoryService } from '../services/job-category.service';

@Controller('api/' + JobCategory.plural)
export class JobCategoryController extends BaseController<JobCategory> {
  constructor(private service: JobCategoryService) {
    super(service, JobCategory);
  }
}
