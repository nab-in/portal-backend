import { NamedEntity } from 'src/core/entities/named.entity';
import { Company } from 'src/modules/company/entities/company.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Job extends NamedEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Name: string;

  @Column()
  Organisation: string;

  @Column()
  Location: string;

  @Column()
  ClosingDate: boolean;

  @Column()
  Email: string;

  @Column()
  Attachment: string;

  @Column()
  Description: string;
  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'companyid', referencedColumnName: 'id' })
  company: Company;
}
