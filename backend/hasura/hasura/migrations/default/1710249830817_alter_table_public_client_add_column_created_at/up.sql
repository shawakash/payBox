alter table "public"."client" add column "created_at" timestamptz
 null default now();
