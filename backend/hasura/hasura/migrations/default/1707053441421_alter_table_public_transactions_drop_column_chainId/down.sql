comment on column "public"."transactions"."chainId" is E'transactions table ';
alter table "public"."transactions" alter column "chainId" drop not null;
alter table "public"."transactions" add column "chainId" text;
