import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { modules } from './modules/modules.export';

@Module({
  // imported modules definition
  imports: [
    ...modules,
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: 'ec2-18-215-111-67.compute-1.amazonaws.com',
      port: 5432,
      username: 'dfckkdjtmnzblu',
      password:
        'e0917d22f2db1c884f949f328f5d6404ddfba8f4f7323fde6878b06066aa106e',
      database: 'd5nek5j478bf4',
      synchronize: true,
      logging: false,
      dropSchema: true,
      entities: ['dist/modules/**/entities/*.entity.js'],
      migrations: ['dist/database/migrations/**/*.js'],
      subscribers: ['src/subscriber/**/*.ts'],
      cli: {
        entitiesDir: 'src/modules/entities',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'src/subscriber',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
