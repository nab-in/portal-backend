import { generateUid } from 'src/core/helpers/makeuid.helper';
import { Job } from 'src/modules/job/entities/job.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
@Entity('user', { schema: 'public' })
export class Company extends NamedEntity {
  static plural = 'companies';

  @Column({
    nullable: true,
    name: 'logo',
    type: 'text',
  })
  logo: string;

  @Column('varchar', {
    nullable: false,
    name: 'location',
  })
  location: string;

  @Column('varchar', {
    nullable: false,
    name: 'website',
  })
  website: string;

  @Column('varchar', {
    nullable: false,
    name: 'title',
  })
  title: string;

  @Column('boolean', {
    nullable: false,
    name: 'about',
  })
  about: string;

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

  @OneToMany(() => Job, (job) => job.company, {
    eager: true,
    cascade: true,
  })
  jobs: Job[];
}
