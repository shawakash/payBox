comment on column "public"."account"."createdAt" is E'accounts in a wallet';
alter table "public"."account" alter column "createdAt" set default now();
alter table "public"."account" alter column "createdAt" drop not null;
alter table "public"."account" add column "createdAt" timestamptz;
