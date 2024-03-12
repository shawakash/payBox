alter table "public"."account" add column "createdAt" timestamptz
 not null default now();
