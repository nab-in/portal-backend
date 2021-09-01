import {
  BeforeUpdate,
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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
  lastUpdated: Date;

  @BeforeInsert()
  beforeInsertTransaction() {
    this.created = new Date();
    this.lastUpdated = new Date();
  }

  @BeforeUpdate()
  beforeUpdateTransaction() {
    this.lastUpdated = this.lastUpdated || new Date();
  }
}
