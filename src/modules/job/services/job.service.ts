import { Injectable } from '@nestjs/common';
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
    const query = `INSERT INTO USERJOBS("userId", "jobId") VALUES(${user.id}, ${job.id})`;
    await this.userrepository.manager.query(query);
    return { message: 'You have successfully applied to this job' };
  }
  async revoke({ job, user }): Promise<{ message: string }> {
    const query = `DELETE FROM USERJOBS WHERE "userId" = ${user.id} AND "jobId"=${job.id}`;
    await this.userrepository.manager.query(query);
    return {
      message: 'You have revoked successfully your application from this job',
    };
  }
  async saveJob(userid: number, jobid: number): Promise<{ message: string }> {
    const sql = `INSERT INTO SAVEDJOB(USERID,JOBID) VALUES(${userid}, ${jobid})`;
    await this.repository.manager.query(sql);
    return { message: `Job saved successfully` };
  }
  async removeJob(userid: number, jobid: number): Promise<{ message: string }> {
    const sql = `DELETE FROM SAVEDJOB  WHERE USERID=${userid} AND JOBID=${jobid}`;
    await this.repository.manager.query(sql);
    return { message: `Job removed successfully` };
  }
}
