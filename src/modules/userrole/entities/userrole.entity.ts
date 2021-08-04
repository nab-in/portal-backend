import {
  BeforeInsert,
  BeforeUpdate,
  Entity,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
import { User } from '../../user/entities/user.entity';
@Entity('userrole', { schema: 'public' })
export class UserRole extends NamedEntity {
  static plural = 'userRoles';

  @ManyToMany(() => User, (user) => user.userroles, {
    cascade: false,
    nullable: true,
  })
  @JoinColumn({ name: 'userroleid', referencedColumnName: 'id' })
  users: User[];

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
}
