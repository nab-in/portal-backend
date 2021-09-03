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
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { diskStorage } from 'multer';
import { systemConfig } from 'src/core/interfaces/system-config';
import {
  editFileName,
  filesFilter,
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
import { Job } from '../../job/entities/job.entity';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('api/' + User.plural)
export class UserController {
  constructor(private service: UserService) {}
  @Post('register')
  @UseFilters(new HttpErrorFilter())
  async register(
    @Req() req: any,
    @Res() res: any,
    @Body() createEntityDto,
  ): Promise<any> {
    Object.keys(createEntityDto).forEach((key) => {
      (createEntityDto[key] === null || createEntityDto[key] === '') &&
        delete createEntityDto[key];
    });
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
      const path: string = '/api/users/' + file.filename + '/dp';
      const response = {
        path,
        message: 'Profile picture saved successfully',
      };
      const user: User = await this.service.findOneByUid(req.user.id);
      const oldDp = user?.dp;
      if (user.id) {
        user.dp = file.filename;
        await this.service.update(user);
        if (oldDp && oldDp !== 'dp.png') {
          fs.unlinkSync(getConfiguration().dp + '/' + oldDp);
        }
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
      fileFilter: filesFilter,
    }),
  )
  async uploadedCv(@UploadedFile() file: any, @Req() req: any) {
    try {
      const path: string = '/api/users/' + file.filename + '/cv';
      const response = {
        path,
        message: 'CV saved successfully',
      };
      const user: User = await this.service.findOneByUid(req.user.id);
      const oldCv = user?.cv;
      if (user.id) {
        user.cv = file.filename;
        await this.service.update(user);
        if (oldCv && oldCv !== 'dp.png') {
          fs.unlinkSync(getConfiguration().cv + '/' + oldCv);
        }
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

  @Post(':id/interview')
  @UseGuards(AuthGuard('jwt'))
  async interview(
    @Body() body: { job: string; location: string; date: Date },
    @Param() param: { id: string },
    @Res() res: any,
  ): Promise<any> {
    let job: any = await this.service.findJob(body.job);
    const user = await this.service.findOneByUid(param.id);
    if (job) {
      if (user) {
        const userJob: {
          jobid: number;
          userid: number;
          accepted: boolean;
          interview: boolean | string;
          date: string;
          location: string;
          created: Date;
        } = await this.service.getUserJobs({
          user,
          job,
          table: 'APPLIEDJOB',
        });
        if (
          userJob &&
          userJob.interview !== null &&
          userJob.interview === false
        ) {
          return res
            .status(HttpStatus.NOT_ACCEPTABLE)
            .send(
              `You can not call <${user.firstname} ${user.lastname}> for the interview job application has already been rejected`,
            );
        } else {
          // console.log('DATE PARSED', Date.parse(userJob.date), userJob);
          /*if (userJob && userJob.date && !isNaN(Date.parse(userJob.date))) {
            console.log('USER JOBS', userJob);
            return res
              .status(HttpStatus.NOT_MODIFIED)
              .send(
                `You have already called ${user.firstname} ${user.lastname} for the interview`,
              );
          }*/

          job = { ...job, ...body };
          const callForInterview = await this.service.interview({
            job,
            user,
          });
          return res.status(HttpStatus.OK).send(callForInterview.message);
        }
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`User with ID ${param.id} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Job with ID ${body.job} could not be found`);
    }
  }

  @Post(':id/accept')
  @UseGuards(AuthGuard('jwt'))
  async accept(
    @Body() body: { job: string },
    @Param() param: { id: string },
    @Res() res: any,
  ): Promise<any> {
    const job = await this.service.findJob(body.job);
    const user = await this.service.findOneByUid(param.id);
    if (job) {
      if (user) {
        const callForInterview = await this.service.accept({ job, user });
        return res.status(HttpStatus.OK).send(callForInterview.message);
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`User with ID ${param.id} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Job with ID ${body.job} could not be found`);
    }
  }

  @Post(':id/reject')
  @UseGuards(AuthGuard('jwt'))
  async rejectinterview(
    @Body() body: { job: string },
    @Param() param: { id: string },
    @Res() res: any,
  ): Promise<any> {
    const job = await this.service.findJob(body.job);
    const user = await this.service.findOneByUid(param.id);
    if (job) {
      if (user) {
        const callForInterview = await this.service.rejectinterview({
          job,
          user,
        });
        return res.status(HttpStatus.OK).send(callForInterview.message);
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`User with ID ${param.id} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Job with ID ${body.job} could not be found`);
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
      jobs: jobs.map((job: Job) => resolveResponse(job)),
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
  async findAll(
    @Query() query,
    @Req() req: any,
    @Res() res: any,
  ): Promise<any> {
    const user: User = req.user;
    if (
      user.userRoles &&
      user.userRoles.map(
        (user) =>
          user.name.toLowerCase().includes('super') ||
          user.name.toLowerCase().includes('admin'),
      ).length > 0
    ) {
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
          query?.fields,
          query?.filter,
          pagerDetails.pageSize,
          pagerDetails.page - 1,
        );
      const userData = {
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
      return res.status(HttpStatus.OK).send(userData);
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send('You have limited access to this resource');
    }
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
    @Req() req: any,
  ): Promise<any> {
    const user: User = req.user;
    if (user.userRoles.length > 0 || user.companies.length > 0) {
      const results = await this.service.findOneByUid(params.id, query.fields);
      if (results) {
        return getSuccessResponse(res, resolveResponse(results));
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: `Item with identifier ${params.id} could not be found`,
        });
      }
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send({ error: 'You have no access to this endpoint' });
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
  @Put()
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async updateUser(
    @Req() req: any,
    @Res() res: any,
    @Param() params,
    @Body() updateEntityDto: User,
  ): Promise<User> {
    if (
      updateEntityDto.username ||
      updateEntityDto.email ||
      updateEntityDto.password
    ) {
      const updateEntity = await this.service.findOneByUid(req.user.id);
      if (updateEntity !== undefined) {
        const verifyOldPassword = await User.validatePassword(
          updateEntityDto['userpassword'],
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
          const data = await this.service.findOneByUid(req.user.id);
          return res.status(HttpStatus.OK).send({
            message: `Item with id ${req.user.id} updated successfully.`,
            payload: resolveResponse(data),
          });
        } else {
          return res.status(HttpStatus.FORBIDDEN).send('Incorrect password');
        }
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send('User with such token is unavailable');
      }
    } else {
      const updateEntity = await this.service.findOneByUid(req.user.id);
      updateEntityDto['id'] = updateEntity['id'];
      const resolvedEntityDTO: any = await this.service.EntityUidResolver(
        updateEntityDto,
        'PUT',
      );
      await this.service.update(resolvedEntityDTO);
      const data = await this.service.findOneByUid(req.user.id);
      return res.status(HttpStatus.OK).send({
        message: `Item with id ${req.user.id} updated successfully.`,
        payload: resolveResponse(data),
      });
    }
  }
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async update(
    @Req() req: any,
    @Res() res: any,
    @Param() params,
    @Body() updateEntityDto,
  ): Promise<User> {
    const user: User = req.user;
    if (
      user.userRoles &&
      user.userRoles.filter(
        (user) => user.name === 'SUPER USER' || user.name === 'ADMIN',
      ).length > 0
    ) {
      const updateEntity = await this.service.findOneByUid(params.id);
      if (updateEntity !== undefined) {
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
          const data = await this.service.findOneByUid(req.user.id);
          return res.status(HttpStatus.OK).send({
            message: `Item with id ${req.user.id} updated successfully.`,
            payload: resolveResponse(data),
          });
        }
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send('User with such token is unavailable');
      }
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send('You have no permission to perform this action');
    }
  }
  @Get(':imgpath/dp')
  seedp(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: getConfiguration().dp });
  }

  @Get(':imgpath/cv')
  seecv(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: getConfiguration().cv });
  }
  @Get('verify')
  async verify(@Res() res: any, @Query() query: { id: string; token: string }) {
    const config: systemConfig = getConfiguration();
    if (query.id && query.token) {
      const user = await this.service.findOneByUid(query.id);
      if (user) {
        if (!user.verified) {
          const secretKey = `${user.email} - ${user.created}`;
          const decoded = jwt.verify(query.token, secretKey);
          if (decoded['id'] === query.id) {
            if (Date.now() >= decoded['exp'] * 1000) {
              return res
                .status(HttpStatus.OK)
                .send('Your token has expired, please reverify');
            } else {
              user.verified = true;
              await this.service.update(user);
              return res
                .status(HttpStatus.OK)
                .send(
                  `Hello <${user.firstname}> You have successfully verified your account. Enjoy Job Portal`,
                );
            }
          } else {
            return res.status(HttpStatus.OK).send('Invalid token');
          }
        } else {
          return res.redirect(config.serverurl);
        }
      } else {
      }
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send('Link is invalid');
    }
  }
}
