import { Controller } from '@nestjs/common';
import { BaseController } from 'src/core/controllers/base.controller';
import { Company } from '../entities/company.entity';
import { CompanyService } from '../services/company.service';

@Controller('api/' + Company.plural)
export class CompanyController extends BaseController<Company> {
  constructor(private service: CompanyService) {
    super(service, Company);
  }
}
