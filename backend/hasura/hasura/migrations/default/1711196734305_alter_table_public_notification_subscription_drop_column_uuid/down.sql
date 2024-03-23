comment on column "public"."notification_subscription"."uuid" is E'notification subscriptions metadata for client';
alter table "public"."notification_subscription" alter column "uuid" drop not null;
alter table "public"."notification_subscription" add column "uuid" uuid;
