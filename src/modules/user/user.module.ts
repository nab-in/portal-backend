import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { JwtPassportStrategy } from './services/jwt.strategy.service';
import { UserService } from './services/user.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'portalbackendis&awesome',
      signOptions: { expiresIn: 317168007729 },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, JwtPassportStrategy],
  exports: [JwtPassportStrategy, PassportModule],
})
export class UserModule {}
