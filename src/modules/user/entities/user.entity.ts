import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../userrole/entities/userrole.entity';
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
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { Company } from '../../company/entities/company.entity';
import { Job } from '../../job/entities/job.entity';

@Entity('user', { schema: 'public' })
export class User extends NamedEntity {
  static plural = 'users';

  @Column('varchar', {
    nullable: false,
    name: 'firstname',
  })
  @ApiProperty()
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

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id' })
  company: Company;

  @ManyToMany(() => Job, (job) => job.users, { nullable: true })
  jobs: Job[];

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
  updatedCompanies: Job[];

  @OneToMany(() => UserRole, (userrole) => userrole.user)
  userroles: UserRole[];

  @BeforeInsert()
  async beforeUpdateTransaction() {
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
    if (this.password) {
      this.salt = await bcrypt.genSalt();
      this.password = await this.hashPassword(this.password, this.salt);
    }
  }
  public static async verifyUser(username: any, password: any): Promise<any> {
    let user: any;
    const email = /^\S+@\S+$/;
    const isEmail = email.test(username);
    if (isEmail) {
      user = await User.findOne({
        where: { email: username },
      });
    } else {
      user = await User.findOne({
        where: { username },
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
