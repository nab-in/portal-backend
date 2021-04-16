import { Entity, Column, PrimaryGeneratedColumn, ManyToOne , OneToMany, ManyToMany,JoinTable } from 'typeorm';


@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Name : string; 

  @Column()
  Organisation : string; 


  @Column()
  Location : string; 

  @Column()
  ClosingDate : Boolean; 

  @Column()
  Email : string; 

  @Column()
  Attachment : string; 

  @Column()
  Description : string; 


}