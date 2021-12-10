import { generateUid } from 'src/core/helpers/makeuid.helper';
import { Job } from '../../job/entities/job.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
@Entity('review', { schema: 'public' })
export class Review extends NamedEntity {
  static plural = 'reviews';

  @Column('bigint', { name: 'value', nullable: true })
  value: number;

  @ManyToOne(() => Job, (job) => job.reviews, {
    cascade: false,
    nullable: false,
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
