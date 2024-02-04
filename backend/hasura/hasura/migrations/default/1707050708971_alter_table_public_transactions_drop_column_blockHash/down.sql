comment on column "public"."transactions"."blockHash" is E'transactions table ';
alter table "public"."transactions" alter column "blockHash" drop not null;
alter table "public"."transactions" add column "blockHash" text;
