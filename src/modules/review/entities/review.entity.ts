import { generateUid } from 'src/core/helpers/makeuid.helper';
import { Job } from 'src/modules/job/entities/job.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
@Entity('Review', { schema: 'public' })
export class Review extends NamedEntity {
  static plural = 'companies';

  @OneToMany(() => Job, (job) => job.reviews, {
    cascade: true,
  })
  @JoinColumn({ name: 'jobid', referencedColumnName: 'id' })
  job: Job;

  @BeforeInsert()
  beforeUpdateTransaction() {
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
  }

  @BeforeUpdate()
  beforeUpdating() {
    this.lastupdated = new Date();
  }
}
