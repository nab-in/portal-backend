/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { generate } from 'rxjs';
import { generateUid } from 'src/core/helpers/makeuid.helper';
import { JobDto } from '../DTO/JobDto';
import { Job } from '../entities/job.entity';

@Injectable()
export class JobService {
  sample = [
    {
      Id: 1,
      Name: 'Software developer',
      Organisation: 'NabinLab',
      Location: 'Dar es Salaam',
      ClosingDate: false,
      Email: 'nabin@nabinLab.com',
      Attachment: 'path/to/fle.pdf',
      Description: 'We need a teenage developer with 30yrs experience',
    },
    {
      Id: 2,
      Name: 'Lawyer',
      Organisation: 'NabinLab',
      Location: 'Dar es Salaam',
      ClosingDate: false,
      Email: 'nabin@nabinLab.com',
      Attachment: 'path/to/fle.pdf',
      Description: 'We need a teenage developer with 30yrs experience',
    },
    {
      Id: 3,
      Name: 'Accountant',
      Organisation: 'NabinLab',
      Location: 'Dar es Salaam',
      ClosingDate: false,
      Email: 'nabin@nabinLab.com',
      Attachment: 'path/to/fle.pdf',
      Description: 'We need a teenage developer with 30yrs experience',
      comapny: { id: generateUid() },
    },
  ];

  /*async getall(): Promise<Job[]> {
    return this.sample;
  }

  async getOne(id: number): Promise<Job> {
    return this.sample[id - 1];
  }*/

  async add(body: any): Promise<any> {}

  async update(body: JobDto, id: string): Promise<void> {}

  async remove(id: string): Promise<void> {}
}
