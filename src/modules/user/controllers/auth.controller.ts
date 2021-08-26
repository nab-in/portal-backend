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
import { AuthGuard } from '@nestjs/passport';
import e from 'express';
import { getSuccessResponse } from 'src/core/utilities/response.helper';
import { HttpErrorFilter } from '../../../core/interceptors/error.filter';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';

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

  @Get('metrics')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async metrics(
    @Req() req: any,
    @Res() res: any,
    @Query() query: any,
  ): Promise<any> {
    const user: User = req.user;
    const admin = user.userRoles.filter(
      (role) => role.name === 'SUPER USER' || role.name === 'ADMIN',
    );
    if (admin.length > 0) {
      const metrics = await this.authService.getMertics(query);
      return res.status(HttpStatus.OK).send(metrics);
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send('You do not have access to this resource');
    }
  }
  @Post('subscribers')
  @UseFilters(new HttpErrorFilter())
  async subscribe(
    @Res() res: any,
    @Body() bod: { name: string; email: string },
  ): Promise<any> {}
}
