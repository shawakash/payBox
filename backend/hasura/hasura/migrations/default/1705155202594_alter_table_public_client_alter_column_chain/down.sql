alter table "public"."client" alter column "chain" drop not null;
ALTER TABLE "public"."client" ALTER COLUMN "chain" drop default;
