import {
  Controller,
  NotFoundException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { BaseController } from 'src/core/controllers/base.controller';
import { editFileName, imageFileFilter } from 'src/core/helpers/sanitize-image';
import { getConfiguration } from 'src/core/utilities/systemConfigs';
import { Company } from '../entities/company.entity';
import { CompanyService } from '../services/company.service';

@Controller('api/' + Company.plural)
export class CompanyController extends BaseController<Company> {
  constructor(private service: CompanyService) {
    super(service, Company);
  }
  @Post(':id/logo')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('', {
      storage: diskStorage({
        destination: getConfiguration().company,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedCv(
    @UploadedFile() file: any,
    @Req() req: any,
    @Param() params: { id: string },
  ) {
    try {
      const path: string = '/api/Companies/' + file.filename + '/cv';
      const response = {
        path,
        message: 'Company Logo saved successfully',
      };
      const company: Company = await this.service.findOneByUid(params.id);
      const oldLogo = company?.logo;
      if (company.id) {
        company.logo = file.filename;
        await this.service.update(company);
        if (oldLogo && oldLogo !== 'logo.png') {
          fs.unlinkSync(getConfiguration().company + '/' + oldLogo);
        }
        return response;
      } else {
        throw new NotFoundException(
          `Company with ID ${company.id} could not be found`,
        );
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
