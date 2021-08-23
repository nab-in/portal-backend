import { Column, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created',
  })
  created: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    default: () => 'NULL::timestamp without time zone',
    name: 'lastupdated',
  })
  lastupdated: Date | null;
}
