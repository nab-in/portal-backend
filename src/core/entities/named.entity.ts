import {
  BeforeUpdate,
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { generateUid } from '../helpers/makeuid.helper';
import { PortalCoreEntity } from './portal.core.entity';

export class NamedEntity extends PortalCoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('char', {
    nullable: false,
    length: 13,
    name: 'uid',
    unique: true,
  })
  uid: string;

  @Column('varchar', {
    nullable: true,
    name: 'name',
  })
  name: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'LOCALTIMESTAMP' })
  created: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'lastupdated',
    default: () => 'LOCALTIMESTAMP',
  })
  lastupdated: Date;

  @BeforeInsert()
  beforeInsertTransaction() {
    this.created = new Date();
    this.lastupdated = new Date();
    this.uid = generateUid();
  }

  @BeforeUpdate()
  beforeUpdateTransaction() {
    this.lastupdated = this.lastupdated || new Date();
  }
}
