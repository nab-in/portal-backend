import { Controller } from '@nestjs/common';
import { BaseController } from 'src/core/controllers/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('api/' + User.plural)
export class UserController extends BaseController<User> {
  constructor(private service: UserService) {
    super(service, User);
  }
}
