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
    @InjectRepository(Job)
    public userrepository: Repository<User>,
  ) {
    super(repository, Job);
  }
  async findUserJobs(uid: string): Promise<any> {
    const user = await this.userrepository.findOne({
      where: { uid },
      relations: ['jobs'],
    });
    return user;
  }
}
