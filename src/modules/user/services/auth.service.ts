import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async login(username: any, password: any): Promise<any> {
    const user: User = await User.verifyUser(username, password);
    const email = /^\S+@\S+$/;
    const isEmail = email.test(username);
    if (user) {
      delete user.password;
      if (!user.enabled) {
        throw new NotAcceptableException(`Your account has been disabled`);
      } else {
        if (isEmail) {
          const token = { token: this.jwtService.sign({ email: username }) };
          return token;
        } else {
          const token = { token: this.jwtService.sign({ username }) };
          return token;
        }
      }
    } else {
      return {
        status: 406,
        message: 'Username or Password Invalid',
      };
    }
  }
}
