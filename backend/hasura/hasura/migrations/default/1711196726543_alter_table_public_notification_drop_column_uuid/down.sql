comment on column "public"."notification"."uuid" is E'notification table for clients';
alter table "public"."notification" alter column "uuid" drop not null;
alter table "public"."notification" add column "uuid" uuid;
