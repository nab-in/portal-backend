import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as Helmet from 'helmet';
import * as Compression from 'compression';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { QueryErrorFilter } from './core/interceptors/error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(Helmet());

  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(express.json({ limit: '50mb' }));

  app.enableCors();
  const { httpAdapter } = app.get(HttpAdapterHost);
  //app.useGlobalFilters(new QueryErrorFilter(httpAdapter));

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(Compression());

  await app.listen(3000);
}
bootstrap();
