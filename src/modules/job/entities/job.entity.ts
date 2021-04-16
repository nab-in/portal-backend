import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Job {
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
}
