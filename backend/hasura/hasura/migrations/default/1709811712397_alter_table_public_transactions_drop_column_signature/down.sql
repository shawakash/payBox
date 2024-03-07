comment on column "public"."transactions"."signature" is E'transactions table ';
alter table "public"."transactions" alter column "signature" drop not null;
alter table "public"."transactions" add column "signature" jsonb;
