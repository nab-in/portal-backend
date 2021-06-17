import {
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseController } from '../../../core/controllers/base.controller';
import { genericFailureResponse } from '../../../core/utilities/response.helper';
import { User } from '../../user/entities/user.entity';
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
      const user: User = await this.service.findUser(req.user.id);
      const job = await this.service.findOneByUid(param.job);
      const createdEntity = await this.service.apply({ job, user });
      if (createdEntity !== undefined) {
        return res.status(HttpStatus.OK).send(createdEntity);
      } else {
        return genericFailureResponse(res);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  @Delete(':job/revoke')
  @UseGuards(AuthGuard('jwt'))
  async revoke(
    @Req() req: any,
    @Res() res: any,
    @Param() param: any,
  ): Promise<any> {
    try {
      const user: User = await this.service.findUser(req.user.id);
      const job = await this.service.findOneByUid(param.job);
      const createdEntity = await this.service.revoke({ job, user });
      if (createdEntity !== undefined) {
        return res.status(HttpStatus.OK).send(createdEntity);
      } else {
        return genericFailureResponse(res);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
