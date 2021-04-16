import { BeforeInsert, Column, Entity } from 'typeorm';
import { NamedEntity } from '../../../../core/entities/named.entity';
@Entity('user', { schema: 'public' })
export class User extends NamedEntity {
  @Column('varchar', {
    nullable: true,
    name: 'name',
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
  }
}

/*
- UserType
- PasswordResetter
- Profile(Foreign)[nulluble]
- Company(Foreign)[nullable]
- Role(Foreign)
*/
