comment on column "public"."chat"."created_at" is E'chat messages for clients';
alter table "public"."chat" alter column "created_at" set default now();
alter table "public"."chat" alter column "created_at" drop not null;
alter table "public"."chat" add column "created_at" timestamptz;
