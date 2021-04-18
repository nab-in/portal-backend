import { generateUid } from 'src/core/helpers/makeuid.helper';
import { BeforeInsert, Column, Entity } from 'typeorm';
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

  @BeforeInsert()
  beforeUpdateTransaction() {
    this.verified = false;
    this.uid = generateUid();
  }
}

/*
- UserType
- PasswordResetter
- Profile(Foreign)[nulluble]
- Company(Foreign)[nullable]
- Role(Foreign)
*/
