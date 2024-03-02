ALTER TABLE "public"."transactions" ALTER COLUMN "date" TYPE timestamptz;
alter table "public"."transactions" alter column "date" set default clock_timestamp();
