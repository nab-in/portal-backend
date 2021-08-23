import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../../job/entities/job.entity';
import { Between, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import jwt_decode from 'jwt-decode';
import {
  getRelations,
  getSelections,
} from '../../../core/helpers/get-fields.utility';
import { Company } from 'src/modules/company/entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    public userrepository: Repository<User>,

    @InjectRepository(Job)
    public jobrepository: Repository<Job>,
    @InjectRepository(Company)
    public companyrepository: Repository<Company>,
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
  async userInfo(uid: string, fields?: any): Promise<User> {
    const metaData = this.userrepository.manager.connection.getMetadata(User);
    return await this.userrepository.findOne({
      where: { uid },
      select: getSelections(fields, metaData),
      relations: getRelations(fields, metaData),
    });
  }
  async getMertics(query: { startDate: Date; endDate: Date }): Promise<any> {
    if (Object.keys(query).length === 0) {
      const users = await this.userrepository.count();
      const companies = await this.companyrepository.count();
      const applications = Number(
        (
          await this.jobrepository.manager.query(
            'SELECT COUNT(*) FROM APPLIEDJOB',
          )
        )[0]['count'],
      );
      const jobs = await this.jobrepository.count();
      return {
        message: 'Job Portal Admin Metrics',
        metrics: { users, companies, applications, jobs },
      };
    } else {
      const date = new Date(query.startDate);
      date.setDate(date.getDate() - 1);
      const startdate = date.toISOString().split('T')[0];
      const dates = new Date(query.endDate);
      dates.setDate(dates.getDate() + 1);
      const enddate = dates.toISOString().split('T')[0];
      const users = await this.userrepository.count({
        where: { created: Between(startdate, enddate) },
      });
      const companies = await this.companyrepository.count({
        where: { created: Between(startdate, enddate) },
      });
      const applications = Number(
        (
          await this.jobrepository.manager.query(
            `SELECT COUNT(*) FROM APPLIEDJOB WHERE CREATED >= '${startdate}' AND CREATED <='${enddate}'`,
          )
        )[0]['count'],
      );
      const jobs = await this.jobrepository.count();
      return {
        message: `Job Portal Admin Metrics from ${query.startDate} to ${query.endDate}`,
        metrics: { users, companies, applications, jobs },
      };
    }
  }
}
