import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './userrole/userrole.module';
@Module({
  imports: [UserRoleModule, UserModule],
})
export class AuthModule {}
