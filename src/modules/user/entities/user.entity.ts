import { generateUid } from 'src/core/helpers/makeuid.helper';
import { passwordHash } from 'src/core/utilities/password.hash';
import { Company } from 'src/modules/company/entities/company.entity';
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
}
