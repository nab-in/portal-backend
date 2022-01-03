import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/controllers/base.controller';
import { SubScriber } from '../entities/subscribers.entity';
import { SubScriberService } from '../services/subscriber.service';

@Controller('api/' + SubScriber.plural)
export class SubScriberController extends BaseController<SubScriber> {
  constructor(private service: SubScriberService) {
    super(service, SubScriber);
  }
}
