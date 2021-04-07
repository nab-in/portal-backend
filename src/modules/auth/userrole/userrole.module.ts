import { Module } from '@nestjs/common';
import { UserRoleController } from './controllers/userrole.controller';
import { UserRoleService } from './services/userrole.service';
@Module({
  imports: [],
  controllers: [UserRoleController],
  providers: [UserRoleService],
})
export class UserRoleModule {}
