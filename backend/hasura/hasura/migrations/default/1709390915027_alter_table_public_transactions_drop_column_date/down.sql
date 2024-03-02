comment on column "public"."transactions"."date" is E'transactions table ';
alter table "public"."transactions" alter column "date" set default now();
alter table "public"."transactions" alter column "date" drop not null;
alter table "public"."transactions" add column "date" timestamptz;
