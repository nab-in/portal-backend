import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { BaseController } from 'src/core/controllers/base.controller';
import { resolveResponse } from 'src/core/resolvers/response.sanitizer';
import {
  genericFailureResponse,
  postSuccessResponse,
} from 'src/core/utilities/response.helper';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('api/' + User.plural)
export class UserController extends BaseController<User> {
  constructor(private service: UserService) {
    super(service, User);
  }
  @Post('register')
  async register(
    @Req() req: any,
    @Res() res: any,
    @Body() createEntityDto,
  ): Promise<any> {
    try {
      const resolvedEntity = await this.service.EntityUidResolver(
        createEntityDto,
      );
      const createdEntity = await this.service.create(resolvedEntity);
      if (createdEntity !== undefined) {
        return postSuccessResponse(res, resolveResponse(createdEntity));
      } else {
        return genericFailureResponse(res);
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
