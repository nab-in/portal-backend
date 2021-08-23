import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { BaseController } from '../../../core/controllers/base.controller';
import { editFileName, imageFileFilter } from 'src/core/helpers/sanitize-image';
import { HttpErrorFilter } from 'src/core/interceptors/error.filter';
import { getConfiguration } from 'src/core/utilities/systemConfigs';
import { User } from '../../user/entities/user.entity';
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
  @Get(':id/metrics')
  @UseFilters(new HttpErrorFilter())
  @UseGuards(AuthGuard('jwt'))
  async companynmetrics(
    @Req() req: any,
    @Res() res: any,
    @Query() query: any,
    @Param() param: any,
  ): Promise<any> {
    const user: User = req.user;
    const userCompany = user.companies.filter(
      (company) => company.id === param.id,
    );
    const admins = user.userRoles.filter((role) => role.name === 'SUPER USER');
    if (userCompany.length > 0 || admins.length > 0) {
      const company = await this.service.findOneByUid(param.id);
      if (company) {
        const metrics = await this.service.companyMetrics({ company });
        return res.status(HttpStatus.OK).send(metrics);
      } else {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send(`Company with ID ${param.id} could not be found`);
      }
    } else {
      return res
        .status(HttpStatus.FORBIDDEN)
        .send(`You do not have access to this resource`);
    }
  }
}
