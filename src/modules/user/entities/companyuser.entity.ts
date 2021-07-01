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

@Entity('companyuser', { schema: 'public' })
export class CompanyUser extends NamedEntity {
  static plural = 'companyusers';

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

  @ManyToOne(() => Company, (company) => company.users, {eager: true})
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id'})
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
      user = await CompanyUser.findOne({
        where: { email: username },
      });
    } else {
      user = await CompanyUser.findOne({
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

