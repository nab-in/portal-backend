import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { query } from 'express';
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';
import { getPagerDetails } from '../../../core/utilities/get-pager-details.utility';
import { BaseController } from '../../../core/controllers/base.controller';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import {
  genericFailureResponse,
  postSuccessResponse,
} from '../../../core/utilities/response.helper';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('api/' + User.plural)
export class UserController extends BaseController<User> {
  constructor(private service: UserService) {
    super(service, User);
  }
  @Post('register')
  @UseFilters(new HttpErrorFilter())
  async register(
    @Req() req: any,
    @Res() res: any,
    @Body() createEntityDto,
  ): Promise<any> {
    const resolvedEntity = await this.service.EntityUidResolver(
      createEntityDto,
    );
    const createdEntity = await this.service.create(resolvedEntity);
    if (createdEntity !== undefined) {
      return postSuccessResponse(res, resolveResponse(createdEntity));
    } else {
      return genericFailureResponse(res);
    }
  }
  @Get('appliedJobs')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async getappliedJobs(
    @Res() res: any,
    @Req() req: any,
    @Query() query: any,
  ): Promise<any> {
    const pagerDetails: any = getPagerDetails(query);

    const user = await this.service.findOneByUid(req.user.id);
    const [jobs, total] = await this.service.findUserJobs({
      user,
      size: pagerDetails.pageSize,
      page: pagerDetails.page - 1,
    });
    delete pagerDetails.nextPage;
    const pager = {
      ...pagerDetails,
      pageCount: jobs.length,
      total,
    };
    if (Math.ceil(total / pager.pageSize) > pager.page) {
      pager['nextPage'] = `/api/${User.plural}/appliedJobs?page=${
        +pagerDetails.page + +'1'
      }`;
    }
    if (
      Math.ceil(total / pager.pageSize) < pager.page &&
      total > pager.pageSize
    ) {
      pager['previousPage'] = `/api/${User.plural}/appliedJobs?page=${
        +pagerDetails.page + +'1'
      }`;
    }
    const response = {
      pager,
      jobs: jobs.map((job) => resolveResponse(job)),
    };
    return res.status(HttpStatus.OK).send(response);
  }
  @Get('createdJobs')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async getCreatedJobs(@Res() res: any, @Req() req: any): Promise<any> {
    const pagerDetails: any = getPagerDetails(query);

    const user = await this.service.findOneByUid(req.user.id);
    const [jobs, total] = await this.service.createdJobs({
      user,
      size: pagerDetails.pageSize,
      page: pagerDetails.page - 1,
    });
    delete pagerDetails.nextPage;
    const pager = {
      ...pagerDetails,
      pageCount: jobs.length,
      total,
    };
    if (Math.ceil(total / pager.pageSize) > pager.page) {
      pager['nextPage'] = `/api/${User.plural}/appliedJobs?page=${
        +pagerDetails.page + +'1'
      }`;
    }
    if (
      Math.ceil(total / pager.pageSize) < pager.page &&
      total > pager.pageSize
    ) {
      pager['previousPage'] = `/api/${User.plural}/appliedJobs?page=${
        +pagerDetails.page + +'1'
      }`;
    }
    const response = {
      pager,
      jobs: jobs.map((job) => resolveResponse(job)),
    };
    return res.status(HttpStatus.OK).send(response);
  }
}
