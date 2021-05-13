import { Job } from 'src/modules/job/entities/job.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import {
  passwordCompare,
  passwordHash,
} from '../../../core/utilities/password.hash';
import { Company } from '../../company/entities/company.entity';
@Entity('user', { schema: 'public' })
export class User extends NamedEntity {
  static plural = 'users';

  @Column('varchar', {
    nullable: true,
    name: 'firstname',
  })
  firstname: string;

  @Column('varchar', {
    nullable: true,
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

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id' })
  company: Company;

  @ManyToMany(() => Job)
  @JoinTable({ name: 'userjobs' })
  jobs: Job[];

  @BeforeInsert()
  async beforeUpdateTransaction() {
    this.verified = false;
    this.enabled = true;
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
    this.password = await passwordHash(this.password);
  }

  @BeforeUpdate()
  async beforeUpdating() {
    this.lastupdated = new Date();
    if (this.password) {
      this.password = await passwordHash(this.password);
    }
  }
  public static async verifyUser(username: any, password: any): Promise<User> {
    let user: User;
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
    if (user && (await passwordCompare(password, user.password))) {
      delete user.password;
      return user;
    } else {
      return null;
    }
  }
}
