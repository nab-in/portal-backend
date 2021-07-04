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
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';
import { BaseController } from '../../../core/controllers/base.controller';
import { genericFailureResponse } from '../../../core/utilities/response.helper';
import { User } from '../../user/entities/user.entity';
import { Job } from '../entities/job.entity';
import { JobService } from '../services/job.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  editFileName,
  imageFileFilter,
} from '../../../core/helpers/sanitize-image';

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

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'src/files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file, @Req() req, @Body() body: any) {
    const job = await this.service.findOneByUid(body.company);

    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    if (job) {
      job['attachment'] = file.filename;
      await this.service.update(job);
      return response;
    } else {
      throw new NotFoundException(
        `Job with ID ${body.company} could not be found`,
      );
    }
  }

  @Post('multiple')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('image', 20, {
      storage: diskStorage({
        destination: 'src/files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      response.push(fileReponse);
    });
    return response;
  }
  @Get(':imgpath/attachment')
  @UseGuards(AuthGuard('jwt'))
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    console.log('imgpath');
    return res.sendFile(image, { root: 'src/files' });
  }
}
