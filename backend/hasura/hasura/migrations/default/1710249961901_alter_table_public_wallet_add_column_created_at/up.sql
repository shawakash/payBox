alter table "public"."wallet" add column "created_at" timestamptz
 null default now();
