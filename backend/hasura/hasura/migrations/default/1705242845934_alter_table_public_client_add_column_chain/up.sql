CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "public"."client" add column "chain" uuid
 not null default gen_random_uuid();
