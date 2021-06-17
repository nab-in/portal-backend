import { Controller, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseController } from '../../../core/controllers/base.controller';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import {
  genericFailureResponse,
  postSuccessResponse,
} from '../../../core/utilities/response.helper';
import { Job } from '../entities/job.entity';
import { JobService } from '../services/job.service';

@Controller('api/' + Job.plural)
export class JobController extends BaseController<Job> {
  constructor(private service: JobService) {
    super(service, Job);
  }
  @Post(':job/apply')
  @UseGuards(AuthGuard('jwt'))
  async apply(
    @Req() req: any,
    @Res() res: any,
    @Param() param: any,
  ): Promise<any> {
    try {
      let user = req.user;
      const jobs = [{ id: param.job }];
      user = { ...user, jobs };
      const resolvedEntity = await this.service.EntityUidResolver(user);
      const userJobs = await this.service.findUserJobs(user.id);
      resolvedEntity.jobs = resolvedEntity.jobs.push(userJobs);
      const createdEntity = await this.service.update(resolvedEntity);
      if (createdEntity !== undefined) {
        return postSuccessResponse(res, resolveResponse(createdEntity));
      } else {
        return genericFailureResponse(res);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
