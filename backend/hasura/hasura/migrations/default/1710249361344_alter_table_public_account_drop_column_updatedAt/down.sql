comment on column "public"."account"."updatedAt" is E'accounts in a wallet';
alter table "public"."account" alter column "updatedAt" set default now();
alter table "public"."account" alter column "updatedAt" drop not null;
alter table "public"."account" add column "updatedAt" timestamptz;
