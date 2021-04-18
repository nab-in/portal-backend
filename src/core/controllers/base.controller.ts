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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PortalCoreEntity } from '../entities/portal.core.entity';
import { ApiResult } from '../interfaces/api-result.interface';
import { DeleteResponse } from '../interfaces/response/delete.interface';
import { resolveResponse } from '../resolvers/response.sanitizer';
import { BaseService } from '../services/base.service';
import { getPagerDetails } from '../utilities/get-pager-details.utility';
import {
  deleteSuccessResponse,
  entityExistResponse,
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
  async findOne(@Res() res: Response, @Param() params): Promise<ApiResult> {
    const results = await this.baseService.findOneByUid(params.id);

    return getSuccessResponse(res, resolveResponse(results));
  }

  @Get(':id/:relation')
  async findOneRelation(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params,
  ): Promise<ApiResult> {
    try {
      const isExist = await this.baseService.findOneByUid(params.id);
      const getResponse = isExist;
      if (isExist !== undefined) {
        return { [params.relation]: getResponse[params.relation] };
      } else {
        return genericFailureResponse(res, params);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createEntityDto,
  ): Promise<ApiResult> {
    try {
      const isIDExist = await this.baseService.findOneByUid(createEntityDto.id);
      if (isIDExist !== undefined) {
        return entityExistResponse(res, isIDExist);
      } else {
        const createdEntity = await this.baseService.create(createEntityDto);
        if (createdEntity !== undefined) {
          return postSuccessResponse(res, resolveResponse(createdEntity));
        } else {
          return genericFailureResponse(res);
        }
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  @Put(':id')
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params,
    @Body() updateEntityDto,
  ): Promise<ApiResult> {
    const updateEntity = await this.baseService.findOneByUid(params.id);
    if (updateEntity !== undefined) {
      const resolvedEntityDTO: any = await this.baseService.EntityUidResolver(
        updateEntityDto,
        updateEntity,
      );

      const payload = await this.baseService.update(resolvedEntityDTO);
      if (payload) {
        return res
          .status(res.statusCode)
          .json({ message: `Item with id ${params.id} updated successfully.` });
      }
    } else {
      return genericFailureResponse(res, params);
    }
    return null;
  }

  @Delete(':id')
  async delete(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResult> {
    try {
      const isExist = await this.baseService.findOneByUid(params.id);
      if (isExist !== undefined) {
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
