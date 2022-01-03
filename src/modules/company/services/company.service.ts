import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../core/services/base.service';
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
  async companyMetrics({ company, query }): Promise<any> {
    const date = new Date(query.startDate || new Date());
    date.setDate(query.startDate ? date.getDate() - 1 : date.getDate() - 31);
    const startdate = date.toISOString();
    const dates = new Date(query.endDate || new Date());
    dates.setDate(dates.getDate() + 1);
    const enddate = dates.toISOString();

    let sql = `SELECT ID FROM JOB WHERE COMPANYID=${company.id}`;
    const jobs = await this.repository.manager.query(sql);
    let applicants = `SELECT COUNT(*) FROM APPLIEDJOB WHERE JOBID IN(${jobs
      .map((job: { id: any }) => job.id)
      .join(',')}) AND CREATED >= '${startdate}' AND CREATED <='${enddate}'`;

    applicants = await this.repository.manager.query(applicants);
    let interviews = `SELECT COUNT(*) FROM APPLIEDJOB WHERE JOBID IN(${jobs
      .map((job: { id: any }) => job.id)
      .join(
        ',',
      )}) AND INTERVIEW=TRUE AND ACCEPTED=TRUE AND CREATED >= '${startdate}' AND CREATED <='${enddate}'`;
    interviews = await this.repository.manager.query(interviews);
    const metrics = {
      message: `Metrics for ${company.name}`,
      startDate: query.startDate || startdate,
      endDate: query.endDate || new Date().toISOString(),
      metrics: {
        applicants: [
          { value: Number(applicants[0]['count']), startdate, enddate },
        ],
        jobs: [{ value: jobs.length, startdate, enddate }],
        interviews: [
          { value: Number(interviews[0]['count']), startdate, enddate },
        ],
      },
    };
    return metrics;
  }
}
