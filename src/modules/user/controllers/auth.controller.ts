import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import { getSuccessResponse } from 'src/core/utilities/response.helper';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseFilters(new HttpErrorFilter())
  async login(@Res() res: any, @Body() loginDTO): Promise<any> {
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
  }
  @Get('logout')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() request: any, @Res() res: any): Promise<any> {
    request.user = null;
    return res
      .status(HttpStatus.OK)
      .send({ message: 'User logged out successfully' });
  }
  @Get('me')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async getUser(
    @Req() req: any,
    @Res() res: any,
    @Query() query: any,
  ): Promise<any> {
    const user = await this.authService.userInfo(req.user.id, query.fields);
    return res.status(HttpStatus.OK).send(resolveResponse(user));
  }

  @Get('companymetrics')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async companynmetrics(
    @Req() req: any,
    @Res() res: any,
    @Query() query: any,
  ): Promise<any> {
    const user = await this.authService.userInfo(req.user.id, query.fields);
    return res.status(HttpStatus.OK).send(resolveResponse(user));
  }
}
