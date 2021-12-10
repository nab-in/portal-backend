import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/services/base.service';
import { Repository } from 'typeorm';
import { JobCategory } from '../entities/job-category.entity';

@Injectable()
export class JobCategoryService extends BaseService<JobCategory> {
  constructor(
    @InjectRepository(JobCategory)
    public repository: Repository<JobCategory>,
  ) {
    super(repository, JobCategory);
  }
}
