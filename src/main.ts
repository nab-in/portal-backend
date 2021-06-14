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
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
