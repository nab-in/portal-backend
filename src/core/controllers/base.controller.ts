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
import { Request, Response } from 'express';
import { SessionGuard } from '../../modules/user/guards/session.guard';
import { PortalCoreEntity } from '../entities/portal.core.entity';
import { QueryErrorFilter } from '../interceptors/error.filter';
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

    const [entityRes, totalCount]: [
      T[],
      number,
    ] = await this.baseService.findAndCount(
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
  @UseGuards(SessionGuard)
  @UseFilters(new QueryErrorFilter())
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createEntityDto,
  ): Promise<ApiResult> {
    // try {
    const resolvedEntity = await this.baseService.EntityUidResolver(
      createEntityDto,
    );
    const createdEntity = await this.baseService.create(resolvedEntity);
    if (createdEntity !== undefined) {
      return postSuccessResponse(res, resolveResponse(createdEntity));
    } else {
      return genericFailureResponse(res);
    }
    // } catch (error) {
    //   res.status(400).json({ error: error.message });
    // }
  }

  @Put(':id')
  @UseGuards(SessionGuard)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params,
    @Body() updateEntityDto,
  ): Promise<ApiResult> {
    const updateEntity = await this.baseService.findOneByUid(params.id);
    if (updateEntity !== undefined) {
      updateEntityDto['id'] = updateEntity['id'];
      const resolvedEntityDTO: any = await this.baseService.EntityUidResolver(
        updateEntityDto,
      );
      const payload = await this.baseService.update(resolvedEntityDTO);
      if (payload) {
        const data = await this.baseService.findOneByUid(params.id);
        return res.status(res.statusCode).json({
          message: `Item with id ${params.id} updated successfully.`,
          payload: resolveResponse(data),
        });
      }
    } else {
      return genericFailureResponse(res, params);
    }
    return null;
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  async delete(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResult> {
    try {
      const entity = await this.baseService.findOneByUid(params.id);
      if (entity !== undefined) {
        const deleteResponse: DeleteResponse = await this.baseService.delete(
          params.id,
        );
        return deleteSuccessResponse(req, res, params, deleteResponse);
      } else {
        return genericFailureResponse(res, params);
      }
    } catch (error) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send(`A property with ID ${params.id} is not available`);
    }
  }
}
