alter table "public"."sol" add column "created_at" timestamptz
 null default now();
