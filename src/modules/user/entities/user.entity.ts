import * as bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';
import { UserRole } from '../../userrole/entities/userrole.entity';

@Entity('user', { schema: 'public' })
export class User extends NamedEntity {
  static plural = 'users';

  @Column('varchar', {
    nullable: false,
    name: 'firstname',
  })
  firstname: string;

  @Column('varchar', {
    nullable: false,
    name: 'email',
    unique: true,
  })
  email: string;

  @Column('varchar', {
    nullable: false,
    name: 'lastname',
  })
  lastname: string;

  @Column('varchar', {
    nullable: false,
    name: 'username',
    unique: true,
  })
  username: string;

  @Column('varchar', {
    nullable: false,
    name: 'password',
  })
  password: string;

  @Column('varchar', {
    nullable: false,
    name: 'salt',
  })
  salt: string;

  @Column('varchar', {
    nullable: true,
    name: 'cv',
  })
  cv: string;

  @Column('varchar', {
    nullable: true,
    name: 'dp',
  })
  dp: string;

  @Column('varchar', {
    nullable: true,
    name: 'title',
  })
  title: string;

  @Column('varchar', {
    nullable: true,
    name: 'bio',
  })
  bio: string;

  @Column('varchar', {
    nullable: true,
    name: 'location',
  })
  location: string;

  @Column('varchar', {
    nullable: true,
    name: 'websitelink',
  })
  websitelink: string;

  @Column('varchar', {
    nullable: true,
    name: 'cvlink',
  })
  cvlink: string;

  @Column('boolean', {
    nullable: false,
    name: 'verified',
  })
  verified: boolean;

  @Column('boolean', {
    nullable: false,
    name: 'enabled',
  })
  enabled: boolean;

  @ManyToMany(() => Company, (companies) => companies.users)
  @JoinTable({
    name: 'usercompanies',
    joinColumn: {
      name: 'userid',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'companyid',
      referencedColumnName: 'id',
    },
  })
  companies: Company[];

  @ManyToMany(() => Job, (job) => job.users, { nullable: true })
  jobs: Job[];

  @ManyToMany(() => Job, (job) => job.userJobs, { nullable: true })
  @JoinTable({
    name: 'savedjob',
    joinColumn: {
      name: 'userid',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'jobid',
      referencedColumnName: 'id',
    },
  })
  savedJobs: Job[];

  @OneToMany(() => Job, (job) => job.createdBy, {
    eager: false,
  })
  createdJobs: Job[];

  @OneToMany(() => Job, (job) => job.lastUpdatedBy, {
    eager: false,
  })
  updatedJobs: Job[];

  @OneToMany(() => Company, (company) => company.createdBy, {
    eager: false,
  })
  createdCompanies: Job[];

  @OneToMany(() => Company, (company) => company.lastUpdatedBy, {
    eager: false,
  })
  updatedCompanies: Company[];
  @ManyToMany(() => UserRole, (userrole) => userrole.users, { nullable: true })
  @JoinTable({
    name: 'userrolesmember',
    joinColumn: {
      name: 'userid',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userroleid',
      referencedColumnName: 'id',
    },
  })
  userRoles: UserRole[];
  @BeforeInsert()
  async beforeUpdateTransaction() {
    this.dp = this.dp || 'dp.png';
    this.verified = false;
    this.enabled = true;
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
    this.salt = await bcrypt.genSalt();
    this.password = await this.hashPassword(this.password, this.salt);
  }

  @BeforeUpdate()
  async beforeUpdating() {
    this.lastupdated = new Date();
  }
  public static async verifyUser(username: any, password: any): Promise<any> {
    let user: any;
    const email = /^\S+@\S+$/;
    const isEmail = email.test(username);
    if (isEmail) {
      user = await User.findOne({
        where: { email: username },
        relations: ['userRoles'],
      });
    } else {
      user = await User.findOne({
        where: { username },
        relations: ['userRoles'],
      });
    }
    if (
      user &&
      (await this.validatePassword(password, user.salt, user.password))
    ) {
      delete user.password;
      delete user.salt;
      return user;
    } else {
      return null;
    }
  }
  async hashPassword(password: string, salt: string): Promise<any> {
    return bcrypt.hash(password, salt);
  }
  public static async validatePassword(
    password: string,
    salt: string,
    userpassword: string,
  ): Promise<boolean> {
    const hash = await bcrypt.hash(password, salt);
    return hash === userpassword;
  }
}
