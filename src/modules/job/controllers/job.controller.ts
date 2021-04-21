import { Controller } from '@nestjs/common';
import { BaseController } from 'src/core/controllers/base.controller';
import { Job } from '../entities/job.entity';
import { JobService } from '../services/job.service';

@Controller('api/' + Job.plural)
export class JobController extends BaseController<Job> {
  constructor(private service: JobService) {
    super(service, Job);
  }
}
