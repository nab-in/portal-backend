import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../core/services/base.service';
import { Repository } from 'typeorm';
import { SubScriber } from '../entities/subscribers.entity';

@Injectable()
export class SubScriberService extends BaseService<SubScriber> {
  constructor(
    @InjectRepository(SubScriber)
    public repository: Repository<SubScriber>,
  ) {
    super(repository, SubScriber);
  }
}
