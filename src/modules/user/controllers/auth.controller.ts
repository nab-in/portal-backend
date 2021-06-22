import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import { getSuccessResponse } from 'src/core/utilities/response.helper';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Res() res: any, @Body() loginDTO): Promise<any> {
    try {
      const user = await this.authService.login(
        loginDTO.username || loginDTO.email,
        loginDTO.password,
      );
      if (user && !user.status) {
        return getSuccessResponse(res, resolveResponse(user));
      } else {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ message: 'Username or Password provided is incorrect.' });
      }
    } catch (e) {
      return e.response.message;
    }
  }
  @Get('logout')
  async logout(@Req() request: any, @Res() res: any): Promise<any> {
    request.user = null;
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User logged out successfully' });
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() req: any, @Res() res: any): Promise<any> {
    try {
      return res.status(HttpStatus.OK).send(resolveResponse(req.user));
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
