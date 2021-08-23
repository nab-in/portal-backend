import { generateUid } from 'src/core/helpers/makeuid.helper';
import { Job } from 'src/modules/job/entities/job.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';

@Entity('company', { schema: 'public' })
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
    unique: true,
  })
  website: string;

  @Column('varchar', {
    nullable: false,
    name: 'title',
  })
  title: string;

  @Column('varchar', {
    nullable: true,
    name: 'about',
    unique: true,
  })
  about: string;

  @Column('varchar', {
    nullable: true,
    name: 'verified',
  })
  verified: string;

  @Column('varchar', {
    nullable: true,
    name: 'bio',
  })
  bio: string;

  @Column('varchar', {
    nullable: true,
    name: 'websitelink',
  })
  websitelink: string;

  @OneToMany(() => Job, (job) => job.company, {
    cascade: true,
  })
  jobs: Job[];

  @ManyToMany(() => User, (users) => users.companies, { nullable: true })
  @JoinColumn({ name: 'usercompanies', referencedColumnName: 'id' })
  users: User[];

  @ManyToOne(() => User, (user) => user.createdCompanies, { nullable: false })
  @JoinColumn({ name: 'createdby' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedCompanies, { nullable: false })
  @JoinColumn({ name: 'lastupdatedby' })
  lastUpdatedBy: User;

  @BeforeInsert()
  beforeUpdateTransaction() {
    this.logo = this.logo || `logo.png`;
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
  }

  @BeforeUpdate()
  beforeUpdating() {
    this.lastupdated = new Date();
  }
}
