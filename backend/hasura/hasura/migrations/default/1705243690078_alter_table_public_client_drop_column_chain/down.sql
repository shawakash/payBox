comment on column "public"."client"."chain" is E'subscriber for paybox';
alter table "public"."client" alter column "chain" set default gen_random_uuid();
alter table "public"."client" alter column "chain" drop not null;
alter table "public"."client" add column "chain" uuid;
