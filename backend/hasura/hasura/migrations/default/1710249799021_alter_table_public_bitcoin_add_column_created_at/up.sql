alter table "public"."bitcoin" add column "created_at" timestamptz
 null default now();
