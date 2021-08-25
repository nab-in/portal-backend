import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { getConfiguration } from '../../core/utilities/systemConfigs';
import { systemConfig } from 'src/core/interfaces/system-config';

export class users1619179734907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const config: systemConfig = getConfiguration();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(config.email.adminpassword, salt);
    await queryRunner.query(`
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
INSERT INTO public."user"(uid,created,lastupdated,firstname,email,username,lastname,password,verified,enabled,salt,dp) 
VALUES(uid(),now(),now(),'Admin','${config.email.adminemail}','admin','Portal','${hash}',true,true,'${salt}', 'dp.png')
    `);
    await queryRunner.query(
      `
      ALTER TABLE APPLIEDJOB ADD COLUMN ACCEPTED BOOLEAN;
      ALTER TABLE APPLIEDJOB ADD COLUMN INTERVIEW BOOLEAN;
      ALTER TABLE JOBCATEGORY ALTER COLUMN NAME SET NOT NULL;
      ALTER TABLE JOBCATEGORY ADD CONSTRAINT UQ_JOBCATEGORY_NAME UNIQUE(name);
      ALTER TABLE USERROLE ADD CONSTRAINT UQ_USERROLE_NAME UNIQUE(name);
      ALTER TABLE APPLIEDJOB ADD COLUMN DATE DATE;
      ALTER TABLE APPLIEDJOB ADD COLUMN LOCATION  CHARACTER VARYING(255);
      ALTER TABLE APPLIEDJOB ADD COLUMN CREATED  DATE;
      INSERT INTO USERROLE(uid,name) values(UID(), 'SUPER USER');
      INSERT INTO USERROLE(uid,name) values(UID(), 'ADMIN');
      INSERT INTO USERROLESMEMBER(userid,userroleid) values(1, 1);
      INSERT INTO USERROLESMEMBER(userid,userroleid) values(1, 2)
      `,
    );
  }

  public async down(): Promise<void> {
    console.log('DOWN');
  }
}
