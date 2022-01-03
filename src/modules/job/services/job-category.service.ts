import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../core/services/base.service';
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
