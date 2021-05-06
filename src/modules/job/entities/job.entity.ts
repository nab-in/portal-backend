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
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { Company } from '../../company/entities/company.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('job', { schema: 'public' })
export class Job extends NamedEntity {
  static plural = 'jobs';
  @Column('varchar', { name: 'descriptio', nullable: true })
  description: string;

  @Column('varchar', { name: 'location', nullable: true })
  location: string;

  @Column('varchar', { name: 'closedate', nullable: true })
  closeDate: string;

  @Column('varchar', { name: 'attachment', nullable: true })
  attachment: string;

  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id' })
  company: Company;

  @OneToMany(() => Review, (review) => review.job)
  reviews: Review[];

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
