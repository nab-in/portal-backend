import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/services/base.service';
import { Job } from '../../job/entities/job.entity';
import { Company } from '../../company/entities/company.entity';
import { In, Repository } from 'typeorm';
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
    const job = await this.repository.manager.query(query);
    if (job.lenght > 0) {
      const appliedJobs = job.map((job: { jobid: any }) => job.jobid);
      const total = job && job[0].count ? job[0].count : 0;
      const jobs = this.jobrepository.find({ where: { id: In(appliedJobs) } });
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
    const query = `UPDATE APPLIEDJOB SET INTERVIEW=TRUE WHERE USERID=${user.id} AND JOBID=${job.id}`;
    await this.repository.manager.query(query);
    return {
      message: `<${user.firstname} ${user.lastname}> has been invited for the interview`,
    };
  }
}
