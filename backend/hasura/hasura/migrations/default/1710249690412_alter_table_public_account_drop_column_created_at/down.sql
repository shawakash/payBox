comment on column "public"."account"."created_at" is E'accounts in a wallet';
alter table "public"."account" alter column "created_at" set default now();
alter table "public"."account" alter column "created_at" drop not null;
alter table "public"."account" add column "created_at" timestamptz;
