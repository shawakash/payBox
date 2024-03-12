alter table "public"."transactions" add column "created_at" timestamptz
 null default now();
