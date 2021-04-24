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

ALTER FUNCTION public.uid()
    OWNER TO postgres;
      CREATE TABLE IF NOT EXISTS public."user"
(
    id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
    uid character(13) COLLATE pg_catalog."default" NOT NULL,
    name character varying COLLATE pg_catalog."default",
    created timestamp without time zone,
    lastupdated timestamp without time zone,
    firstname character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    lastname character varying COLLATE pg_catalog."default" NOT NULL,
    username character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    verified boolean NOT NULL,
    enabled boolean NOT NULL,
    companyid integer,
    CONSTRAINT "PK_03b91d2b8321aa7ba32257dc321" PRIMARY KEY (id),
    CONSTRAINT "FK_e485849b81bbc53a1ac2d88193a" FOREIGN KEY (companyid)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

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
