comment on column "public"."transactions"."time" is E'transactions table ';
alter table "public"."transactions" alter column "time" drop not null;
alter table "public"."transactions" add column "time" time;
