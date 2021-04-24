import { Injectable, NotAcceptableException } from '@nestjs/common';
import { throwError } from 'rxjs/internal/observable/throwError';
import { passwordCompare } from 'src/core/utilities/password.hash';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  //   constructor() {}
  async login(username: any, password: any): Promise<User> {
    const user: User = await User.findOne({ where: { username } });
    console.log('USER', user);
    const hashedPassword = await passwordCompare(password, user.password);
    if (hashedPassword) {
      delete user.password;
      if (!user.enabled) {
        throw new NotAcceptableException(`Your account has been disabled`);
      } else {
        return user;
      }
    } else {
      throwError('Username or Password Invalid');
    }
  }
}
