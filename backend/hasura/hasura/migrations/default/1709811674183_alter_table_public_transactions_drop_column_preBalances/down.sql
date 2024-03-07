comment on column "public"."transactions"."preBalances" is E'transactions table ';
alter table "public"."transactions" alter column "preBalances" drop not null;
alter table "public"."transactions" add column "preBalances" jsonb;
