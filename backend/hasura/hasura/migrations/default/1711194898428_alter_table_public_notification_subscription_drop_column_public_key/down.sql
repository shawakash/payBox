comment on column "public"."notification_subscription"."public_key" is E'notification subscriptions metadata for client';
alter table "public"."notification_subscription" alter column "public_key" drop not null;
alter table "public"."notification_subscription" add column "public_key" text;
