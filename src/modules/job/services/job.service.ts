import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../core/services/base.service';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';

@Injectable()
export class JobService extends BaseService<Job> {
  constructor(
    @InjectRepository(Job)
    public repository: Repository<Job>,
    @InjectRepository(User)
    public userrepository: Repository<User>,
  ) {
    super(repository, Job);
  }
  async findUser(uid: string): Promise<User> {
    const sessionUser = await this.userrepository.findOne({
      where: { uid },
      select: ['id'],
    });
    return sessionUser;
  }
  async apply({ job, user }): Promise<{ message: string }> {
    const query = `INSERT INTO APPLIEDJOB(USERId, JOBID) VALUES(${user.id}, ${job.id})`;
    await this.userrepository.manager.query(query);
    return {
      message: `You have successfully applied to with name ${job.name}`,
    };
  }
  async revoke({ job, user }): Promise<{ message: string }> {
    const query = `DELETE FROM APPLIEDJOB WHERE USERID = ${user.id} AND JOBID=${job.id}`;
    await this.userrepository.manager.query(query);
    return {
      message: `You have revoked successfully your application from job with name <${job.name}>`,
    };
  }
  async saveJob({ user, job }): Promise<{ message: string }> {
    const sql = `INSERT INTO SAVEDJOB(USERID,JOBID) VALUES(${user.id}, ${job.id})`;
    try {
      await this.repository.manager.query(sql);
      return { message: `Job with name <${job.name}> saved successfully` };
    } catch (e) {
      if (e && e.detail && e.detail.includes('already exists')) {
        throw new HttpException(
          `You have already saved job with name <${job.name}>`,
          HttpStatus.CONFLICT,
        );
      } else {
        throw new Error(e.message);
      }
    }
  }
  async removeJob({ user, job }): Promise<{ message: string }> {
    const sql = `DELETE FROM SAVEDJOB  WHERE USERID=${user} AND JOBID=${job}`;
    await this.repository.manager.query(sql);
    return { message: `Job removed successfully` };
  }
}
