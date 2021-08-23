import {
  Body,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from '../../modules/user/entities/user.entity';
import { PortalCoreEntity } from '../entities/portal.core.entity';
import { HttpErrorFilter } from '../interceptors/error.filter';
import { ApiResult } from '../interfaces/api-result.interface';
import { DeleteResponse } from '../interfaces/response/delete.interface';
import { resolveResponse } from '../resolvers/response.sanitizer';
import { BaseService } from '../services/base.service';
import { getPagerDetails } from '../utilities/get-pager-details.utility';
import {
  deleteSuccessResponse,
  genericFailureResponse,
  getSuccessResponse,
  postSuccessResponse,
} from '../utilities/response.helper';
import { getConfiguration } from '../utilities/systemConfigs';

export class BaseController<T extends PortalCoreEntity> {
  constructor(
    private readonly baseService: BaseService<T>,
    private readonly Model: typeof PortalCoreEntity,
  ) {}

  @Get()
  async findAll(@Query() query): Promise<ApiResult> {
    if (query.paging === 'false') {
      const allContents: T[] = await this.baseService.findAll();
      return {
        [this.Model.plural]: (allContents || []).map((contents) =>
          resolveResponse(contents),
        ),
      };
    }

    const pagerDetails: any = getPagerDetails(query);

    const [entityRes, totalCount]: [T[], number] =
      await this.baseService.findAndCount(
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
        nextPage: `/api/${this.Model.plural}?page=${+pagerDetails.page + +'1'}`,
      },
      [this.Model.plural]: (entityRes || []).map((contents) =>
        resolveResponse(contents),
      ),
    };
  }

  @Get(':id')
  @UseFilters(new HttpErrorFilter())
  async findOne(
    @Res() res: Response,
    @Param() params,
    @Query() query,
  ): Promise<ApiResult> {
    const results = await this.baseService.findOneByUid(
      params.id,
      query.fields,
    );
    if (results) {
      return getSuccessResponse(res, resolveResponse(results));
    } else {
      return res.status(HttpStatus.NOT_FOUND).send({
        message: `Item with identifier ${params.id} could not be found`,
      });
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createEntityDto,
  ): Promise<ApiResult> {
    const user = req.user;
    const resolvedEntity = await this.baseService.EntityUidResolver(
      createEntityDto,
      user,
      'POST',
    );
    const createdEntity = await this.baseService.create(resolvedEntity);
    if (createdEntity !== undefined) {
      return postSuccessResponse(res, resolveResponse(createdEntity));
    } else {
      return genericFailureResponse(res);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params,
    @Body() updateEntityDto,
  ): Promise<ApiResult> {
    const updateEntity = await this.baseService.findOneByUid(params.id);
    if (updateEntity !== undefined) {
      const user: any = req.user;
      const userroles: any[] = user.userRoles.filter(
        (role: { name: string }) =>
          role.name === 'SUPER USER' || role.name === 'ADMIN',
      );
      const usercompanies: any[] = user.companies.filter(
        (company: { id: any }) => company.id === params.id,
      );
      if (usercompanies.length > 0 || userroles.length > 0) {
        if (
          this.Model.plural === 'companies' ||
          this.Model.plural === 'jobcategory'
        ) {
          if (updateEntityDto.verified && userroles.length > 0) {
            updateEntityDto['id'] = updateEntity['id'];
            const resolvedEntityDTO: any =
              await this.baseService.EntityUidResolver(updateEntityDto, 'PUT');
            const payload = await this.baseService.update(resolvedEntityDTO);
            if (payload) {
              const data = await this.baseService.findOneByUid(params.id);
              return res.status(res.statusCode).json({
                message: `Item with id ${params.id} updated successfully.`,
                payload: resolveResponse(data),
              });
            }
          } else if (!updateEntityDto.verified) {
            updateEntityDto['id'] = updateEntity['id'];
            const resolvedEntityDTO: any =
              await this.baseService.EntityUidResolver(updateEntityDto, 'PUT');
            const payload = await this.baseService.update(resolvedEntityDTO);
            if (payload) {
              const data = await this.baseService.findOneByUid(params.id);
              return res.status(res.statusCode).json({
                message: `Item with id ${params.id} updated successfully.`,
                payload: resolveResponse(data),
              });
            }
          } else {
            return res
              .status(HttpStatus.FORBIDDEN)
              .send('You have no permission to perform this action');
          }
        } else {
          updateEntityDto['id'] = updateEntity['id'];
          const resolvedEntityDTO: any =
            await this.baseService.EntityUidResolver(updateEntityDto, 'PUT');
          const payload = await this.baseService.update(resolvedEntityDTO);
          if (payload) {
            const data = await this.baseService.findOneByUid(params.id);
            return res.status(res.statusCode).json({
              message: `Item with id ${params.id} updated successfully.`,
              payload: resolveResponse(data),
            });
          }
        }
      } else {
        return res
          .status(HttpStatus.FORBIDDEN)
          .send('You have limited access to perform this action');
      }
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`Object with ID ${params.id} could not be found`);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseFilters(new HttpErrorFilter())
  async delete(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResult> {
    const entity = await this.baseService.findOneByUid(params.id);
    if (entity !== undefined) {
      const deleteResponse: DeleteResponse = await this.baseService.delete(
        params.id,
      );
      return deleteSuccessResponse(req, res, params, deleteResponse);
    } else {
      return genericFailureResponse(res, params);
    }
  }
  @Get(':imgpath/logo')
  sendcompanylogo(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: getConfiguration().company });
  }
}
