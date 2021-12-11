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
CREATE OR REPLACE FUNCTION public.uid()
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
VALUES(uid(),now(),now(),'Admin','portal@admin.com','admin','Portal','$2b$10$etf2eD7e8bAqR4BNUItZ7.b78dbgbIEtKPEWLY8Gmvlz3.Wy5nmXS',true,true,'$2b$10$etf2eD7e8bAqR4BNUItZ7.', 'dp.png')
ALTER TABLE APPLIEDJOB ADD COLUMN ACCEPTED BOOLEAN;
ALTER TABLE APPLIEDJOB ADD COLUMN INTERVIEW BOOLEAN;
ALTER TABLE JOBCATEGORY ALTER COLUMN NAME SET NOT NULL;
ALTER TABLE JOBCATEGORY ADD CONSTRAINT UQ_JOBCATEGORY_NAME UNIQUE(name);
ALTER TABLE USERROLE ADD CONSTRAINT UQ_USERROLE_NAME UNIQUE(name);
ALTER TABLE APPLIEDJOB ADD COLUMN DATE TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE APPLIEDJOB ADD COLUMN LOCATION  CHARACTER VARYING(255);
ALTER TABLE APPLIEDJOB ADD COLUMN CREATED  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT ('now'::text)::TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE SAVEDJOB ADD COLUMN CREATED  DATE;
INSERT INTO USERROLE(uid,name) values(UID(), 'SUPER USER');
INSERT INTO USERROLE(uid,name) values(UID(), 'ADMIN');
INSERT INTO USERROLESMEMBER(userid,userroleid) values(1, 1);
INSERT INTO USERROLESMEMBER(userid,userroleid) values(1, 2);
    `);
    await queryRunner.query(
      `
      ALTER TABLE APPLIEDJOB ADD COLUMN ACCEPTED BOOLEAN;
      ALTER TABLE APPLIEDJOB ADD COLUMN INTERVIEW BOOLEAN;
      ALTER TABLE JOBCATEGORY ALTER COLUMN NAME SET NOT NULL;
      ALTER TABLE JOBCATEGORY ADD CONSTRAINT UQ_JOBCATEGORY_NAME UNIQUE(name);
      ALTER TABLE USERROLE ADD CONSTRAINT UQ_USERROLE_NAME UNIQUE(name);
      ALTER TABLE APPLIEDJOB ADD COLUMN DATE TIMESTAMP WITHOUT TIME ZONE;
      ALTER TABLE APPLIEDJOB ADD COLUMN LOCATION  CHARACTER VARYING(255);
      ALTER TABLE APPLIEDJOB ADD COLUMN CREATED  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT ('now'::text)::TIMESTAMP WITHOUT TIME ZONE;
      ALTER TABLE SAVEDJOB ADD COLUMN CREATED  DATE;
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
