import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { getPagerDetails } from 'src/core/utilities/get-pager-details.utility';
import { BaseController } from '../../../core/controllers/base.controller';
import {
  editFileName,
  filesFilter,
} from '../../../core/helpers/sanitize-image';
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import {
  genericFailureResponse,
  postSuccessResponse,
} from '../../../core/utilities/response.helper';
import { getConfiguration } from '../../../core/utilities/systemConfigs';
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
  @UseFilters(new HttpErrorFilter())
  async apply(
    @Req() req: any,
    @Res() res: any,
    @Param() param: any,
  ): Promise<any> {
    const user: User = await this.service.findUser(req.user.id);
    const job = await this.service.findOneByUid(param.job);
    const createdEntity = await this.service.apply({ job, user });
    if (createdEntity !== undefined) {
      return res.status(HttpStatus.OK).send(createdEntity);
    } else {
      return genericFailureResponse(res);
    }
  }

  @Get(':job/applicants')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async getApplicants(
    @Req() req: any,
    @Res() res: any,
    @Param() param: any,
    @Query() query: any,
  ): Promise<any> {
    const job = await this.service.findOneByUid(param.job);
    const pagerDetails: any = getPagerDetails(query);

    const [applicants, count] = await this.service.applicants({
      job,
      page: pagerDetails.page - 1,
      size: pagerDetails.pageSize,
      query,
    });
    if (applicants !== undefined) {
      const pager = {
        ...pagerDetails,
        pageCount: applicants.length,
        total: Number(count),
      };
      if (Math.ceil(count / pager.pageSize) > pager.page) {
        pager['nextPage'] = `/api/${Job.plural}/applicants?page=${
          +pagerDetails.page + +'1'
        }`;
      }
      if (
        Math.ceil(count / pager.pageSize) < pager.page &&
        count > pager.pageSize
      ) {
        pager['previousPage'] = `/api/${Job.plural}/applicants?page=${
          +pagerDetails.page + +'1'
        }`;
      }
      if (pager.nextPage.length == 0) {
        delete pager.nextPage;
      }
      const response = {
        pager,
        users: applicants.map((applicant: User) => resolveResponse(applicant)),
      };
      return res.status(HttpStatus.OK).send(response);
    } else {
      return genericFailureResponse(res);
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  @UseInterceptors(
    FileInterceptor('', {
      storage: diskStorage({
        destination: getConfiguration().job,
        filename: editFileName,
      }),
      fileFilter: filesFilter,
    }),
  )
  async createJobs(
    @Req() req: any,
    @Res() res: any,
    @Body() createEntityDto: Job,
    @UploadedFile() file,
  ): Promise<any> {
    const user: User = req.user;
    Object.keys(createEntityDto).forEach((key) => {
      (createEntityDto[key] === null || createEntityDto[key] === '') &&
        delete createEntityDto[key];
    });
    const userCompany = user.companies.filter(
      (company) => company.id === createEntityDto.company.id,
    );
    if (userCompany.length > 0) {
      const resolvedEntity = await this.service.EntityUidResolver(
        createEntityDto,
        user,
        'POST',
      );
      if (file && file.filename) {
        resolvedEntity['attachment'] = file.filename;
      }

      const createdEntity = await this.service.create(resolvedEntity);
      if (createdEntity !== undefined) {
        return postSuccessResponse(res, resolveResponse(createdEntity));
      } else {
        return genericFailureResponse(res);
      }
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send('You have no permission to perform this action');
    }
  }
  @Delete(':job/revoke')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async revoke(
    @Req() req: any,
    @Res() res: any,
    @Param() param: any,
  ): Promise<any> {
    const user: User = await this.service.findUser(req.user.id);
    const job = await this.service.findOneByUid(param.job);
    const createdEntity = await this.service.revoke({ job, user });
    if (createdEntity !== undefined) {
      return res.status(HttpStatus.OK).send(createdEntity);
    } else {
      return genericFailureResponse(res);
    }
  }

  @Post(':id/profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('', {
      storage: diskStorage({
        destination: getConfiguration().job,
        filename: editFileName,
      }),
      fileFilter: filesFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file: any, @Param() params: any) {
    const job = await this.service.findOneByUid(params.id);
    const oldAttachment = job?.attachment;
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    if (job) {
      job['attachment'] = file.filename;
      await this.service.update(job);

      /*
       * Delete Old Attachment file
       */
      if (oldAttachment) {
        fs.unlinkSync(getConfiguration().job + '/' + oldAttachment);
      }
      return response;
    } else {
      fs.unlinkSync(getConfiguration().job + '/' + file.filename);
      throw new NotFoundException(
        `Job with ID ${params.id} could not be found`,
      );
    }
  }

  @Get(':imgpath/attachment')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: getConfiguration().job });
  }
  @Post(':job/save')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async saveJob(
    @Req() req: any,
    @Res() res: any,
    @Param() param,
  ): Promise<any> {
    const job = await this.service.findOneByUid(param.job);
    const user = await this.service.findUser(req.user.id);
    const saved = await this.service.saveJob({ job, user });
    return res.status(HttpStatus.CREATED).send(saved);
  }

  @Delete(':job/remove')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async removeJob(
    @Req() req: any,
    @Res() res: any,
    @Param() param,
  ): Promise<any> {
    const job = await this.service.findOneByUid(param.job);
    const user = await this.service.findUser(req.user.id);
    const saved = await this.service.removeJob({ job: job.id, user: user.id });
    return res.status(HttpStatus.OK).send(saved);
  }
  @Get(':id/applications/:user')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async getJobApplications(
    @Param() params: { id: string; user: string },
    @Res() res: any,
  ) {
    const job = await this.service.findOneByUid(
      params.id,
      'id,name,created,lastupdated,description,company',
    );
    if (job) {
      const user = await this.service.findUser(params.user);
      if (user) {
        const data: any[] = await this.service.getUserJobs({
          user,
          job,
          table: 'APPLIEDJOB',
        });
        if (data.length > 0) {
          let application = await this.service.findApplications({ job, user });
          application = { ...application[0], user, job };
          return res.status(HttpStatus.OK).send(resolveResponse(application));
        } else {
          return res
            .status(HttpStatus.NOT_FOUND)
            .send(`You have no application for this job`);
        }
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`User with ID ${params.user} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Job with ID ${params.id} could not be found`);
    }
  }
  @Get(':id/saves/:user')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async getSaves(
    @Param() params: { id: string; user: string },
    @Res() res: any,
  ) {
    const job = await this.service.findOneByUid(
      params.id,
      'id,name,created,lastupdated,description,company',
    );
    if (job) {
      const user = await this.service.findUser(params.user);
      if (user) {
        const data: any[] = await this.service.getUserJobs({
          user,
          job,
          table: 'SAVEDJOB',
        });
        if (data.length > 0) {
          let application = await this.service.findSaves({ job, user });
          application = { ...application[0], user, job };
          return res.status(HttpStatus.OK).send(resolveResponse(application));
        } else {
          return res
            .status(HttpStatus.NOT_FOUND)
            .send(`You have not saved this job yet`);
        }
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`User with ID ${params.user} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Job with ID ${params.id} could not be found`);
    }
  }
}
