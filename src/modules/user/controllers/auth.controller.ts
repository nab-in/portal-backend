import {
  Body,
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
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';

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
      if (user) {
        return getSuccessResponse(res, resolveResponse(user));
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

  @Post('test')
  @UseGuards(AuthGuard())
  async test(@Req() data): Promise<any> {
    console.log('DATA', data.user);
  }
}
