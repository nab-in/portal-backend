import { NamedEntity } from '../../../../core/entities/named.entity';
import { Entity } from 'typeorm';
@Entity('userrole', { schema: 'public' })
export class UserRole extends NamedEntity {}

/*
- UserType
- PasswordResetter
- Profile(Foreign)[nulluble]
- Company(Foreign)[nullable]
- Role(Foreign)
*/
