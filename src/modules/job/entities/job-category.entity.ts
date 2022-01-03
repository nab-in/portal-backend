import { SubScriber } from '../../user/entities/subscribers.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { Job } from './job.entity';

@Entity('jobcategory', { schema: 'public' })
@Tree('materialized-path')
export class JobCategory extends NamedEntity {
  static plural = 'jobCategories';

  @Column('varchar', {
    nullable: true,
    name: 'verified',
  })
  verified: boolean;

  @TreeParent()
  parent: JobCategory;

  @TreeChildren()
  children: JobCategory[];

  @ManyToMany(() => Job, (job) => job.categories, { nullable: true })
  jobs: Job[];

  @ManyToMany(() => SubScriber, (subscribers) => subscribers.jobCategories, {
    nullable: true,
  })
  subscribers: SubScriber[];
  @BeforeInsert()
  beforeInsertTransaction() {
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
    this.verified = false;
  }

  @BeforeUpdate()
  beforeUpdating() {
    this.lastupdated = new Date();
  }
}
