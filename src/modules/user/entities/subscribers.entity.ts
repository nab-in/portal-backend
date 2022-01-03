import { generateUid } from '../../../core/helpers/makeuid.helper';
import { JobCategory } from '../../job/entities/job-category.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';

@Entity('subscribers', { schema: 'public' })
export class SubScriber extends NamedEntity {
  static plural = 'subscribers';
  @Column('varchar', {
    nullable: true,
    name: 'email',
  })
  email: string;
  @ManyToMany(() => JobCategory, (jobCategory) => jobCategory.subscribers, {
    nullable: false,
  })
  @JoinTable({
    name: 'preferences',
    joinColumn: {
      name: 'categoryid',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subscriberid',
      referencedColumnName: 'id',
    },
  })
  jobCategories: JobCategory[];

  @BeforeInsert()
  beforeInsertTransaction() {
    this.created = new Date();
    this.uid = generateUid();
  }
  @BeforeUpdate()
  beforeUpdateTransaction() {
    this.lastupdated = new Date();
  }
}
