alter table "public"."eth" add column "created_at" timestamptz
 null default now();
