alter table "public"."transactions" add column "time" timestamptz
 not null default now();
