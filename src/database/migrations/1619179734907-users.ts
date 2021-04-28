import { MigrationInterface, QueryRunner } from 'typeorm';

export class users1619179734907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE OR REPLACE FUNCTION public.uid(
	)
    RETURNS text
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
SELECT substring('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
FROM (random()*51)::int +1 for 1) ||
array_to_string(ARRAY(SELECT substring('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
FROM (random()*61)::int + 1 FOR 1)
FROM generate_series(1,12)), '')
$BODY$;
      ALTER TABLE public."user"
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
