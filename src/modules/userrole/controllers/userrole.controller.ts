import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/controllers/base.controller';
import { UserRole } from '../entities/userrole.entity';
import { UserRoleService } from '../services/userrole.service';

@Controller('api/' + UserRole.plural)
export class UserRoleController extends BaseController<UserRole> {
  constructor(private service: UserRoleService) {
    super(service, UserRole);
  }
}
