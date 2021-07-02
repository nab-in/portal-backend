import { Injectable } from '@nestjs/common';
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


  async belongToCompany( user, companyid ): Promise<any> {

    let query = `SELECT * FROM public."user" WHERE "id"=${user.id}`;
    
    const userToFind = (await this.repository.manager.query(query))[0];
   

    const company = await this.companyrepository.findOne({ where: { id: userToFind.companyid } });
   
    
    if(company){
      if(company.uid == companyid){
        return {BelongstoCompany: true}
      } else return {BelongstoCompany: false}
    } else return {message: 'This user is not present in the system'}

  }


}
