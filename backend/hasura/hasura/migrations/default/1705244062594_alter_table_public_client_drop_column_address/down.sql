comment on column "public"."client"."address" is E'subscriber for paybox';
alter table "public"."client" alter column "address" set default jsonb_build_array();
alter table "public"."client" alter column "address" drop not null;
alter table "public"."client" add column "address" jsonb;
