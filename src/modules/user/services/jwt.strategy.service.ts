import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { resolveResponse } from '../../../core/resolvers/response.sanitizer';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
@Injectable()
export class JwtPassportStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    public userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'portalbackendis&awesome',
    });
  }
  async validate(payload: { username: string; email: string }): Promise<any> {
    try {
      let user: User;
      if (payload.email) {
        user = await this.userRepository.findOne({
          where: { email: payload.email },
          relations: ['userRoles'],
        });
      }
      if (payload.username) {
        user = await this.userRepository.findOne({
          where: { username: payload.username },
          relations: ['userRoles'],
        });
      }
      if (!user) {
        throw new UnauthorizedException();
      }
      return resolveResponse(user);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
