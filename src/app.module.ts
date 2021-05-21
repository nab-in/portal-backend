import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueryErrorFilter } from './core/interceptors/error.filter';
import { modules } from './modules/modules.export';

@Module({
  // imported modules definition
  imports: [...modules, TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: QueryErrorFilter,
    },
  ],
})
export class AppModule {}
