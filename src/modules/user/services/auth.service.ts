import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../../job/entities/job.entity';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

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
      let query = `SELECT "jobId" FROM USERJOBS WHERE "userId"=${user.id}`;
      const appliedJobs = (await this.userrepository.manager.query(query)).map(
        (job: { jobId: any }) => job.jobId,
      );
      user['appliedJobs'] = await this.jobrepository.find({
        where: {
          id: In(appliedJobs),
        },
      });
      user['createdJobs'] = await this.jobrepository.find({
        where: {
          createdBy: user,
        },
      });
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
}
