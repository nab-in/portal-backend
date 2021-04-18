import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { generateUid } from '../helpers/makeuid.helper';

export class NamedEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('char', {
    nullable: false,
    length: 13,
    name: 'uid',
  })
  uid: string;

  @Column('varchar', {
    nullable: true,
    name: 'name',
  })
  name: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'datecreated',
  })
  created: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    default: () => 'NULL::timestamp without time zone',
    name: 'lastupdated',
  })
  lastupdated: Date | null;

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
