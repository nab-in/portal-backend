import { BeforeInsert, BeforeUpdate, Entity } from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';
@Entity('userrole', { schema: 'public' })
export class UserRole extends NamedEntity {
  static plural = 'userRoles';
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
