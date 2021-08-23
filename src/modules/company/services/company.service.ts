import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/services/base.service';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(
    @InjectRepository(Company)
    public repository: Repository<Company>,
  ) {
    super(repository, Company);
  }
  async companyMetrics({ company }): Promise<any> {
    let sql = `SELECT ID FROM JOB WHERE COMPANYID=${company.id}`;
    const jobs = await this.repository.manager.query(sql);
    let applicants = `SELECT COUNT(*) FROM APPLIEDJOB WHERE JOBID IN(${jobs
      .map((job: { id: any }) => job.id)
      .join(',')})`;
    applicants = await this.repository.manager.query(applicants);
    let interviews = `SELECT COUNT(*) FROM APPLIEDJOB WHERE JOBID IN(${jobs
      .map((job: { id: any }) => job.id)
      .join(',')}) AND INTERVIEW=TRUE AND ACCEPTED=TRUE`;
    interviews = await this.repository.manager.query(interviews);
    const metrics = {
      message: `Metrics for ${company.name}`,
      metrics: {
        applicants: Number(applicants[0]['count']),
        jobs: jobs.length,
        interviews: Number(interviews[0]['count']),
      },
    };
    return metrics;
  }
}
