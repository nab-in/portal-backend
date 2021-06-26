import { User } from '../../user/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
@Entity('userrole', { schema: 'public' })
export class UserRole extends NamedEntity {
  static plural = 'userRoles';

  @ManyToOne(() => User, (user) => user.userroles, {
    cascade: false,
  })
  @JoinColumn({ name: 'userid', referencedColumnName: 'id' })
  user: User;

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
