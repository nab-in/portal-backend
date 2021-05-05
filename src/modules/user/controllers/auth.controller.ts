import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { resolveResponse } from 'src/core/resolvers/response.sanitizer';
import { getSuccessResponse } from 'src/core/utilities/response.helper';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(AuthGuard)
  async login(@Res() res: any, @Session() session: any): Promise<any> {
    try {
      if (session.user) {
        return getSuccessResponse(res, resolveResponse(session.user));
      } else {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ message: 'Username or Password provided is incorrect.' });
      }
    } catch (e) {
      console.log(e);
    }
  }
  @Get('logout')
  async logout(@Req() request: any, @Res() res: any): Promise<any> {
    request.session = null;
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User logged out successfully' });
  }
}
