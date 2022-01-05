import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  getRelations,
  getSelections,
} from '../../../core/helpers/get-fields.utility';
import { getWhereConditions } from '../../../core/helpers/get-where-conditions.utility';
import { resolveWhereJob } from '../../../core/helpers/resolvewhere';
import { BaseService } from '../../../core/services/base.service';
import { User } from '../../user/entities/user.entity';
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
    });
    return sessionUser;
  }
  async apply({ job, user }): Promise<{ message: string }> {
    const query = `INSERT INTO APPLIEDJOB(CREATED, USERId, JOBID) VALUES(NOW(),${user.id}, ${job.id})`;
    await this.userrepository.manager.query(query);
    return {
      message: `You have successfully applied to with name <${job.name}>`,
    };
  }
  async applicants({ job, size, page, query }): Promise<any> {
    let sql = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT * FROM APPLIEDJOB WHERE JOBID=${job.id}) AS TBL OFFSET ${page} LIMIT ${size}`;
    if (Object.keys(query).length > 0) {
      if (query.startDate && query.endDate) {
        const date = new Date(query.startDate);
        date.setDate(date.getDate() - 1);
        const startdate = date.toISOString();
        const dates = new Date(query.endDate);
        dates.setDate(dates.getDate() + 1);
        const enddate = dates.toISOString();
        sql = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT * FROM APPLIEDJOB A WHERE A.JOBID=${job.id} AND A.DATE >= '${startdate}' AND A.DATE <='${enddate}') AS TBL OFFSET ${page} LIMIT ${size}`;
      }
      if (query.startDtae && !query.endDate) {
        const date = new Date(query.startDate);
        date.setDate(date.getDate() - 1);
        const startdate = date.toISOString();
        sql = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT * FROM APPLIEDJOB A WHERE A.JOBID=${job.id} AND A.DATE >= '${startdate}') AS TBL OFFSET ${page} LIMIT ${size}`;
      }
      if (query.endDtae && !query.startDate) {
        const dates = new Date(query.endDate);
        dates.setDate(dates.getDate() + 1);
        const enddate = dates.toISOString();
        sql = `SELECT *, COUNT(*) OVER() AS COUNT FROM (SELECT * FROM APPLIEDJOB A WHERE A.JOBID=${job.id} AND A.DATE <='${enddate}') AS TBL OFFSET ${page} LIMIT ${size}`;
      }
    }
    const jobApplicants = await this.repository.manager.query(sql);
    if (jobApplicants.length > 0) {
      let applicants = jobApplicants.map(async (data: { userid: any }) => {
        const user = await this.userrepository.findOne({
          where: { id: data.userid },
        });
        return { ...data, ...user };
      });
      applicants = [].concat.apply([], await Promise.all(applicants));
      const total =
        jobApplicants && jobApplicants[0].count ? jobApplicants[0].count : 0;
      return [applicants, total];
    } else {
      return [[], 0];
    }
  }
  async findApplications({ job, user }): Promise<any> {
    const sql = `SELECT * FROM APPLIEDJOB WHERE USERID=${user.id} AND JOBID=${job.id}`;
    const application = await this.repository.manager.query(sql);
    return application;
  }
  async findSaves({ job, user }): Promise<any> {
    const sql = `SELECT * FROM SAVEDJOB WHERE USERID=${user.id} AND JOBID=${job.id}`;
    const application = await this.repository.manager.query(sql);
    return application;
  }
  async revoke({ job, user }): Promise<{ message: string }> {
    const query = `DELETE FROM APPLIEDJOB WHERE USERID = ${user.id} AND JOBID=${job.id}`;
    await this.userrepository.manager.query(query);
    return {
      message: `You have revoked successfully your application from job with name <${job.name}>`,
    };
  }
  async saveJob({ user, job }): Promise<{ message: string }> {
    const sql = `INSERT INTO SAVEDJOB(CREATED,USERID,JOBID) VALUES(NOW(), ${user.id}, ${job.id})`;
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
  async getUserJobs({ user, table, job }): Promise<any> {
    const sql = `SELECT * FROM ${table} A WHERE A.JOBID=${job.id} AND A.USERID=${user.id}`;
    const data = await this.repository.manager.query(sql);
    return data;
  }
  async findAndCount(
    fields: any,
    filter: any,
    size: number,
    page: number,
  ): Promise<[Job[], number]> {
    const metaData = this.modelRepository.manager.connection.getMetadata(
      this.Model,
    );
    let where = Object.assign(
      {},
      ...((
        await resolveWhereJob(this.modelRepository, getWhereConditions(filter))
      )['checks'] || []),
    );
    const categories: any[] = (
      await resolveWhereJob(this.modelRepository, getWhereConditions(filter))
    )['categories'];
    if (categories && categories.length > 0) {
      const ids: any[] = await this.modelRepository.manager.query(
        `SELECT "jobId" FROM CATEGORIESJOB WHERE "jobcategoryId" IN(${categories
          .map(({ id }) => id)
          .join(',')})`,
      );
      where = { ...where, id: In(ids.map(({ jobId }) => jobId)) };
    }
    const relations = getRelations(fields, metaData);
    const select = getSelections(fields, metaData);
    return await this.modelRepository.findAndCount({
      select,
      relations,
      where,
      skip: page * size,
      take: size,
    });
  }
}
