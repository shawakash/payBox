comment on column "public"."transactions"."address" is E'transactions table ';
alter table "public"."transactions" alter column "address" drop not null;
alter table "public"."transactions" add column "address" text;
