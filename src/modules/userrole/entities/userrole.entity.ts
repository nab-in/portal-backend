import { generateUid } from '../../../core/helpers/makeuid.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Entity,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { User } from '../../user/entities/user.entity';
@Entity('userrole', { schema: 'public' })
export class UserRole extends NamedEntity {
  static plural = 'userRoles';

  @ManyToMany(() => User, (user) => user.userRoles, {
    cascade: false,
    nullable: true,
  })
  @JoinColumn({ name: 'userroleid', referencedColumnName: 'id' })
  users: User[];

  @BeforeInsert()
  beforeInsertTransaction() {
    this.uid = generateUid();
  }

  @BeforeUpdate()
  beforeUpdateTransaction() {
    this.lastupdated = new Date();
  }
}
