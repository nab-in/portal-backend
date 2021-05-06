import {
  BeforeInsert,
  BeforeUpdate,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { NamedEntity } from '../../../core/entities/named.entity';
import { generateUid } from '../../../core/helpers/makeuid.helper';

@Entity('jobcategory', { schema: 'public' })
export class JobCategory extends NamedEntity {
  static plural = 'jobCategories';

  @ManyToOne(() => JobCategory, (jobParent) => jobParent.children)
  parent: JobCategory;

  @OneToMany(() => JobCategory, (category) => category.parent)
  children: JobCategory[];

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
