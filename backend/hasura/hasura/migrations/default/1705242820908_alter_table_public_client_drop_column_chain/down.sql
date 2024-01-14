comment on column "public"."client"."chain" is E'subscriber for paybox';
alter table "public"."client" alter column "chain" set default jsonb_build_object();
alter table "public"."client" alter column "chain" drop not null;
alter table "public"."client" add column "chain" jsonb;
