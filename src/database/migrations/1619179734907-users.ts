import { MigrationInterface, QueryRunner } from 'typeorm';

export class users1619179734907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE APPLIEDJOB ADD COLUMN ACCEPTED BOOLEAN',
    );
    await queryRunner.query(
      'ALTER TABLE APPLIEDJOB ADD COLUMN INTERVIEW BOOLEAN',
    );
    await queryRunner.query('ALTER TABLE APPLIEDJOB ADD COLUMN DATE DATE');
    await queryRunner.query(
      'ALTER TABLE APPLIEDJOB ADD COLUMN LOCATION  VARYING CHARACTER(255)',
    );
  }

  public async down(): Promise<void> {
    console.log('DOWN');
  }
}
