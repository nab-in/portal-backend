import { MigrationInterface, QueryRunner } from 'typeorm';

export class users1619179734907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public."user"
    OWNER to postgres;
INSERT INTO public."user"(uid,created,lastupdated,firstname,email,username,lastname,password,verified,enabled) 
VALUES(uid(),now(),now(),'Admin','portal@admin.portal','admin','Portal','$2b$10$OuJ.NcPd0yryT7mE3sgbcuousQ7Wn5GmK0C.LvK7HdoYAPL/.0dxK',true,true)
    `,
    );
  }

  public async down(): Promise<void> {
    console.log('DOWN');
  }
}
