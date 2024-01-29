comment on column "public"."transactions"."client_id" is E'transactions table ';
alter table "public"."transactions" alter column "client_id" drop not null;
alter table "public"."transactions" add column "client_id" uuid;
