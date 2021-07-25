import { User } from 'src/modules/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { Company } from '../../company/entities/company.entity';
import { Review } from '../../review/entities/review.entity';
import { JobCategory } from './job-category.entity';

@Entity('job', { schema: 'public' })
export class Job extends NamedEntity {
  static plural = 'jobs';
  @Column('varchar', { name: 'description', nullable: false })
  description: string;

  @Column('varchar', { name: 'location', nullable: true })
  location: string;

  @Column('varchar', {
    nullable: true,
    name: 'email',
    unique: false,
  })
  email: string;

  @Column('varchar', {
    nullable: true,
    name: 'deadline',
    unique: false,
  })
  deadline: Date;

  @Column('date', { name: 'closedate', nullable: true })
  closeDate: Date;

  @Column('varchar', { name: 'attachment', nullable: true })
  attachment: string;

  @ManyToOne(() => Company, (company) => company.jobs, { nullable: false })
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id' })
  company: Company;

  @OneToMany(() => Review, (review) => review.job)
  reviews: Review[];

  @ManyToOne(() => User, (user) => user.createdJobs, { nullable: false })
  @JoinColumn({ name: 'createdby' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedJobs, { nullable: false })
  @JoinColumn({ name: 'lastupdatedby' })
  lastUpdatedBy: User;

  @ManyToMany(() => User, (user) => user.jobs, { nullable: true })
  @JoinColumn({ name: 'jobid', referencedColumnName: 'id' })
  @JoinTable({ name: 'userjobs' })
  users: User[];

  @ManyToMany(() => User, (user) => user.savedJobs, { nullable: true })
  @JoinColumn({ name: 'jobid', referencedColumnName: 'id' })
  userJobs: User[];

  @ManyToMany(() => JobCategory, (categories) => categories.jobs, {
    nullable: true,
  })
  @JoinColumn({ name: 'jobid', referencedColumnName: 'id' })
  @JoinTable({ name: 'categoriesjob' })
  categories: JobCategory[];

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
