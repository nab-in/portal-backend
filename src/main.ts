import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import * as Compression from 'compression';
import * as express from 'express';
import * as Helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './core/interceptors/error.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { getConfiguration } from './core/utilities/systemConfigs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(Helmet());

  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(express.json({ limit: '50mb' }));

  app.enableCors();
  // const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpErrorFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(Compression());
  /* const config = new DocumentBuilder()
    .setTitle('Portal Backend')
    .setDescription('All Portal API backend endpoints')
    .setVersion('1.0')
    .addTag('Job Portal')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);*/

  await app.listen((await getConfiguration().port) || 3000);
  Logger.log(
    `App listening on Port: ${(await getConfiguration().port) || 3000} `,
    await app.getUrl(),
  );
}
bootstrap();
