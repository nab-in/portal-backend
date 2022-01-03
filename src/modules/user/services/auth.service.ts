import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import jwt_decode from 'jwt-decode';
import { Between, Repository } from 'typeorm';
import {
  getRelations,
  getSelections,
} from '../../../core/helpers/get-fields.utility';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';
import { User } from '../entities/user.entity';

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
    const date = new Date(query.startDate || new Date());
    date.setDate(query.startDate ? date.getDate() - 1 : date.getDate() - 31);
    const startdate = date.toISOString();
    const dates = new Date(query.endDate || new Date());
    dates.setDate(dates.getDate() + 1);
    const enddate = dates.toISOString();

    const where = {
      created: Between(startdate, enddate),
    };

    const users = await this.userrepository.count({
      where,
    });
    const companies = await this.companyrepository.count({
      where,
    });
    const applications = Number(
      (
        await this.jobrepository.manager.query(
          `SELECT COUNT(*) FROM APPLIEDJOB WHERE CREATED >= '${startdate}' AND CREATED <='${enddate}'`,
        )
      )[0]['count'],
    );
    const jobs = await this.jobrepository.count({
      where,
    });
    return {
      message: 'Job Portal Admin Metrics',
      startDate: query.startDate || startdate,
      endDate: query.endDate || enddate,
      metrics: {
        users: [
          {
            startdate: query.startDate || startdate,
            enddate: query.endDate || enddate,
            value: users,
          },
        ],
        companies: [
          {
            startdate: query.startDate || startdate,
            enddate: query.endDate || enddate,
            value: companies,
          },
        ],
        applications: [
          {
            startdate: query.startDate || startdate,
            enddate: query.endDate || enddate,
            value: applications,
          },
        ],
        jobs: [
          {
            startdate: query.startDate || startdate,
            enddate: query.endDate || enddate,
            value: jobs,
          },
        ],
      },
    };
  }
}
