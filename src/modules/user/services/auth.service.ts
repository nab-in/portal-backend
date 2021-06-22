import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../../job/entities/job.entity';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import jwt_decode from 'jwt-decode';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    public userrepository: Repository<User>,

    @InjectRepository(Job)
    public jobrepository: Repository<Job>,
  ) {}
  async login(username: any, password: any): Promise<any> {
    const user: User = await User.verifyUser(username, password);
    const email = /^\S+@\S+$/;
    const isEmail = email.test(username);
    if (user) {
      if (!user.enabled) {
        throw new NotAcceptableException(`Your account has been disabled`);
      } else {
        if (isEmail) {
          const token = {
            token: this.jwtService.sign({ email: username }),
            ...user,
          };
          return token;
        } else {
          const token = { token: this.jwtService.sign({ username }), ...user };
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
  async getUser(token: string): Promise<User> {
    try {
      const decoded: { email: string; username: string } = jwt_decode(token);
      let user: User;
      if (decoded.email) {
        user = await this.userrepository.findOne({
          where: { email: decoded.email },
        });
      }
      if (decoded.username) {
        user = await this.userrepository.findOne({
          where: { username: decoded.username },
        });
      }
      return user;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
