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
    let query = `SELECT "jobId" FROM USERJOBS WHERE "userId"=${user.id}`;
    let appliedJobs = (await this.repository.manager.query(query)).map(
      (job: { jobId: any }) => job.jobId,
    );
    const [jobs, total] = await this.jobrepository.findAndCount({
      where: {
        id: In(appliedJobs),
      },
      skip: page * size,
      take: size,
    });
    return [jobs, total];
  }

  async findSavedJobs({ user, page, size }): Promise<any> {
    let query = `SELECT JOBID FROM SAVEDJOBS WHERE USERID=${user.id}`;
    let appliedJobs = (await this.repository.manager.query(query)).map(
      (job: { jobId: any }) => job.jobId,
    );
    const [jobs, total] = await this.jobrepository.findAndCount({
      where: {
        id: In(appliedJobs),
      },
      skip: page * size,
      take: size,
    });
    return [jobs, total];
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
    uid: string,
  ): Promise<{ message: string | boolean }> {
    const userCompany = await this.companyrepository.find({
      where: { createdBy: user, uid },
    });
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
}
