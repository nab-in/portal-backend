import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
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
import { query } from 'express';
import fs from 'fs';
import { diskStorage } from 'multer';
import { BaseController } from '../../../core/controllers/base.controller';
import {
  editFileName,
  imageFileFilter,
} from '../../../core/helpers/sanitize-image';
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import { getPagerDetails } from '../../../core/utilities/get-pager-details.utility';
import {
  genericFailureResponse,
  getSuccessResponse,
  postSuccessResponse,
} from '../../../core/utilities/response.helper';
import { getConfiguration } from '../../../core/utilities/systemConfigs';
import { Company } from '../../company/entities/company.entity';
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

  @Post('dp')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('', {
      storage: diskStorage({
        destination: getConfiguration().dp,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const response = {
        originalname: file.originalname,
        filename: file.filename,
      };
      const user: User = await this.service.findOneByUid(req.user.id);
      if (user.id) {
        user.dp =
          getConfiguration().serverurl +
          '/api/users/' +
          file.filename +
          '/attachment';
        await this.service.update(user);
        return response;
      } else {
        throw new NotFoundException(
          `User with ID ${user.id} could not be found`,
        );
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Post('cv')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('', {
      storage: diskStorage({
        destination: getConfiguration().cv,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedCv(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      const response = {
        originalname: file.originalname,
        filename: file.filename,
      };
      const user: User = await this.service.findOneByUid(req.user.id);
      if (user.id) {
        user.cv =
          getConfiguration().serverurl +
          '/api/users/' +
          file.filename +
          '/attachment';
        await this.service.update(user);
        return response;
      } else {
        throw new NotFoundException(
          `User with ID ${user.id} could not be found`,
        );
      }
    } catch (e) {
      throw new Error(e.message);
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
  @Get('savedJobs')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async savedjobs(
    @Res() res: any,
    @Req() req: any,
    @Query() query: any,
  ): Promise<any> {
    const pagerDetails: any = getPagerDetails(query);

    const user = await this.service.findOneByUid(req.user.id);
    const [jobs, total] = await this.service.findSavedJobs({
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
      pager['nextPage'] = `/api/${User.plural}/savedJobs?page=${
        +pagerDetails.page + +'1'
      }`;
    }
    if (
      Math.ceil(total / pager.pageSize) < pager.page &&
      total > pager.pageSize
    ) {
      pager['previousPage'] = `/api/${User.plural}/savedJobs?page=${
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
  @Get()
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query): Promise<any> {
    if (query.paging === 'false') {
      const allContents: User[] = await this.service.findAll();
      return {
        [User.plural]: (allContents || []).map((contents) =>
          resolveResponse(contents),
        ),
      };
    }

    const pagerDetails: any = getPagerDetails(query);

    const [entityRes, totalCount]: [User[], number] =
      await this.service.findAndCount(
        query.fields,
        query.filter,
        pagerDetails.pageSize,
        pagerDetails.page - 1,
      );

    return {
      pager: {
        ...pagerDetails,
        pageCount: entityRes.length,
        total: totalCount,
        nextPage: `/api/${User.plural}?page=${+pagerDetails.page + +'1'}`,
      },
      [User.plural]: (entityRes || []).map((contents) =>
        resolveResponse(contents),
      ),
    };
  }
  @Get('belongstocompany')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async belongCompany(
    @Res() res: any,
    @Query() query: any,
    @Req() req: any,
  ): Promise<any> {
    if (query.company) {
      const company: Company = await this.service.findCompany(query.company);
      if (company) {
        const user: User = await this.service.findOneByUid(req.user.id);
        const Belongs = await this.service.belongToCompany(user, company);
        if (Belongs) {
          return getSuccessResponse(res, resolveResponse(Belongs));
        } else {
          return res.status(HttpStatus.NOT_FOUND).send({
            error: `There was no company with id ${query.company} in the system`,
          });
        }
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          error: `A company with id ${query.company} is not available in the system`,
        });
      }
    } else {
      return res.status(HttpStatus.NOT_FOUND).send({
        error: `Missing a required Company attribute.`,
      });
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async findOneUser(
    @Res() res: any,
    @Param() params,
    @Query() query,
  ): Promise<any> {
    const results = await this.service.findOneByUid(params.id, query.fields);
    if (results) {
      return getSuccessResponse(res, resolveResponse(results));
    } else {
      return res.status(HttpStatus.NOT_FOUND).send({
        message: `Item with identifier ${params.id} could not be found`,
      });
    }
  }
  @Put('passwordupdate')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async changePassword(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
  ): Promise<any> {
    const user = await this.service.findOneByUid(req.user.id);
    const changedPassword = await this.service.changePassword(user, body);
    return res.status(HttpStatus.OK).send(resolveResponse(changedPassword));
  }
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async updateUser(
    @Req() req: any,
    @Res() res: any,
    @Param() params,
    @Body() updateEntityDto,
  ): Promise<User> {
    const updateEntity = await this.service.findOneByUid(params.id);
    if (updateEntity !== undefined) {
      if (updateEntityDto.email || updateEntityDto.username) {
        const verifyOldPassword = await User.validatePassword(
          updateEntityDto.userpassword,
          updateEntity.salt,
          updateEntity.password,
        );
        if (verifyOldPassword) {
          updateEntityDto['id'] = updateEntity['id'];
          const resolvedEntityDTO: any = await this.service.EntityUidResolver(
            updateEntityDto,
            'PUT',
          );
          await this.service.update(resolvedEntityDTO);
          const data = await this.service.findOneByUid(params.id);
          return res.status(HttpStatus.OK).send({
            message: `Item with id ${params.id} updated successfully.`,
            payload: resolveResponse(data),
          });
        }
      }

      if (!updateEntityDto.email && !updateEntityDto.username) {
        updateEntityDto['id'] = updateEntity['id'];
        const resolvedEntityDTO: any = await this.service.EntityUidResolver(
          updateEntityDto,
          'PUT',
        );
        await this.service.update(resolvedEntityDTO);
        const data = await this.service.findOneByUid(params.id);
        return res.status(HttpStatus.OK).send({
          message: `Item with id ${params.id} updated successfully.`,
          payload: resolveResponse(data),
        });
      }
    }
  }
  @Get(':imgpath/attachment')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: getConfiguration().user });
  }
}
