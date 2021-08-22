import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
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
    @Body() createEntityDto,
    @UploadedFile() file,
  ): Promise<any> {
    const user = req.user;
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
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    if (job) {
      job['attachment'] = file.filename;
      await this.service.update(job);
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
    const saved = await this.service.saveJob(job.id, user.id);
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
    const saved = await this.service.removeJob(job.id, user.id);
    return res.status(HttpStatus.OK).send(saved);
  }
}
