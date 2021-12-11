import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpErrorFilter } from './core/interceptors/error.filter';
import { getDataBaseConfiguration } from './core/utilities/systemConfigs';
import { modules } from './modules/modules.export';

@Module({
  imports: [
    ...modules,
    TypeOrmModule.forRoot({
      ...getDataBaseConfiguration,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      type: 'postgres',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: HttpErrorFilter }],
})
export class AppModule {}
