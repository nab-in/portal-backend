import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { passwordReset } from '../../../core/helpers/templates/password.reset.template';
import { BaseService } from '../../../core/services/base.service';
import { In, Repository } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    public repository: Repository<User>,

    @InjectRepository(Company)
    public companyrepository: Repository<Company>,

    @InjectRepository(Job)
    public jobrepository: Repository<Job>,
  ) {
    super(repository, User);
  }
  async findUserJobs({ user, page, size }): Promise<any> {
    const query = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT * FROM APPLIEDJOB WHERE USERID=${user.id}) AS TBL OFFSET ${page} LIMIT ${size}`;
    const appliedJobs = await this.repository.manager.query(query);
    if (appliedJobs.length > 0) {
      let jobs = appliedJobs.map(async (data: { jobid: any }) => {
        const jobData = await this.jobrepository.findOne({
          where: { id: data.jobid },
          relations: ['company'],
        });
        return { ...data, ...jobData };
      });
      jobs = await Promise.all(jobs);
      const total =
        appliedJobs && appliedJobs[0].count ? appliedJobs[0].count : 0;
      return [jobs, total];
    } else {
      return [[], 0];
    }
  }

  async findSavedJobs({ user, page, size }): Promise<any> {
    const query = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT JOBID FROM SAVEDJOB WHERE USERID=${user.id}) AS TBL OFFSET ${page} LIMIT ${size}`;
    const savedjob: any = await this.repository.manager.query(query);
    if (savedjob.length > 0) {
      const appliedJobs = savedjob.map((job: { jobid: any }) => job.jobid);
      const total = savedjob && savedjob[0].count ? savedjob[0].count : 0;
      const jobs = await this.jobrepository.find({
        where: { id: In(appliedJobs) },
        relations: ['company'],
      });
      return [jobs, total];
    } else {
      return [[], 0];
    }
  }

  async createdJobs({ user, page, size }): Promise<any> {
    const [jobs, total] = await this.jobrepository.findAndCount({
      where: {
        createdBy: user,
      },
      skip: page * size,
      take: size,
    });
    return [jobs, total];
  }

  async belongToCompany(
    user: User,
    company: Company,
  ): Promise<{ message: string | boolean }> {
    const query = `SELECT * FROM USERCOMPANIES WHERE USERID=${user.id} AND COMPANYID=${company.id}`;
    const userCompany = await this.companyrepository.manager.query(query);
    if (userCompany.length > 0) {
      return { message: true };
    } else {
      throw new NotFoundException(`User does not belong to company`);
    }
  }
  async findCompany(uid: string): Promise<Company> {
    const company = await this.companyrepository.findOne({ uid });
    return company;
  }
  async findJob(uid: string): Promise<Job> {
    const job = await this.jobrepository.findOne({ uid });
    return job;
  }
  async changePassword(
    user: User,
    body: { oldPassword: any; newPassword: any },
  ): Promise<any> {
    try {
      const verifyOldPassword = await User.validatePassword(
        body.oldPassword,
        user.salt,
        user.password,
      );
      if (verifyOldPassword) {
        user.password = body.newPassword;
        await this.repository.save(user);
        return {
          message: `Your Password has been changed successfully`,
        };
      } else {
        throw new Error('Your old password is incorrect');
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async interview({ job, user }): Promise<any> {
    const query = `UPDATE APPLIEDJOB SET INTERVIEW=TRUE, DATE='${new Date(
      job.date,
    ).toISOString()}', LOCATION='${job.location}' WHERE USERID=${
      user.id
    } AND JOBID=${job.id}`;
    await this.repository.manager.query(query);
    return {
      message: `<${user.firstname} ${user.lastname}> has been invited for the interview`,
    };
  }

  async rejectinterview({ job, user }): Promise<any> {
    const query = `UPDATE APPLIEDJOB SET INTERVIEW=FALSE WHERE USERID=${user.id} AND JOBID=${job.id}`;
    await this.repository.manager.query(query);
    return {
      message: `<${user.firstname} ${user.lastname}'s> application has been rejected`,
    };
  }

  async accept({ job, user }): Promise<any> {
    const query = `UPDATE APPLIEDJOB SET ACCEPTED=TRUE WHERE USERID=${user.id} AND JOBID=${job.id}`;
    await this.repository.manager.query(query);
    return {
      message: `You have accepted the call for interview for job <${job.name}>`,
    };
  }
  async getUserJobs({ user, table, job }): Promise<any> {
    const sql = `SELECT * FROM ${table} A WHERE A.JOBID=${job.id} AND A.USERID=${user.id}`;
    const data = await this.repository.manager.query(sql);
    return data;
  }

  async findUser(payload: { user?: any }): Promise<any> {
    try {
      const email: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      const isEmail = email.test(payload.user);
      if (isEmail) {
        const user = await this.repository.findOne({
          where: { email: payload.user },
        });
        return user;
      } else {
        const user = await this.repository.findOne({
          where: { username: payload.user },
        });
        return user;
      }
    } catch (e) {
      return e.message;
    }
  }
  async sendmail(user: User): Promise<any> {
    const config = {
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
    try {
      const secretKey = `${user.password} - ${user.created}`;
      const userId = user.uid;
      const token = jwt.sign({ userId }, secretKey, {
        expiresIn: 3600,
      });
      const url = `${process.env.SERVER_URL}/users?userid=${user.uid}&token=${token}`;
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        requireTLS: true,
        auth: config.auth,
      });
      const message = {
        from: `${process.env.PORTAL_NAME || 'Job Portal'} Password Recovery <${
          config.auth.user
        }>`,
        to: `"${user.firstname}" <${user.email}>`,
        subject: 'Password Reset Email',
        text: `Hello ${user.firstname}.`,
        html: `${passwordReset(user, url)}`,
      };

      transport.sendMail(message, function (error) {
        if (error) {
          console.log(error);
          return error.message;
        } else {
          return true;
        }
      });
      return { message: `Password Reset email has been sent to ${user.email}` };
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async updatePassword(user: User, body: { token: string; password: any }) {
    try {
      const secretKey = `${user.password} - ${user.created}`;
      const decoded = jwt.verify(body.token, secretKey);
      if (decoded['userId'] === user.uid) {
        user.salt = await bcrypt.genSaltSync();
        user.password = await bcrypt.hash(body.password, user.salt);
        user.enabled = true;
        await this.repository.save(user);
        return {
          message: `Your Password has been reset successfully`,
          user: user,
        };
      }
    } catch (e) {
      console.log(e.message);
      throw new BadRequestException(
        `We are unable to verify your identity, the link might have either expired or used twice. Please, use the the forgot password options on login page to get a fresh link`,
      );
    }
  }
}
