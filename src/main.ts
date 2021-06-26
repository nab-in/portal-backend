import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Compression from 'compression';
import * as express from 'express';
import * as Helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './core/interceptors/error.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(Helmet());

  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(express.json({ limit: '50mb' }));

  app.enableCors();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpErrorFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(Compression());
  const config = new DocumentBuilder()
    .setTitle('Portal Backend')
    .setDescription('All Portal API backend endpoints')
    .setVersion('1.0')
    .addTag('Job Portal')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(7000);
}
bootstrap();
