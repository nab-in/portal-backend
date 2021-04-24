import { generateUid } from '../../../core/helpers/makeuid.helper';
import {
  passwordCompare,
  passwordHash,
} from '../../../core/utilities/password.hash';
import { Company } from '../../company/entities/company.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
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
  })
  username: string;

  @Column('varchar', {
    nullable: false,
    name: 'password',
  })
  password: string;

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

  @BeforeInsert()
  async beforeUpdateTransaction() {
    this.verified = false;
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
    const user: User = await User.findOne({
      where: { username },
    });
    console.log('USER:::', user);
    if (user && (await passwordCompare(password, user.password))) {
      delete user.password;
      return user;
    } else {
      return null;
    }
  }
}
