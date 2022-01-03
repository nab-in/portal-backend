import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../core/services/base.service';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/userrole.entity';

@Injectable()
export class UserRoleService extends BaseService<UserRole> {
  constructor(
    @InjectRepository(UserRole)
    public repository: Repository<UserRole>,
  ) {
    super(repository, UserRole);
  }
}
