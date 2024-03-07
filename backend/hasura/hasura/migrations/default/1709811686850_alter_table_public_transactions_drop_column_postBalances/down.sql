comment on column "public"."transactions"."postBalances" is E'transactions table ';
alter table "public"."transactions" alter column "postBalances" drop not null;
alter table "public"."transactions" add column "postBalances" jsonb;
