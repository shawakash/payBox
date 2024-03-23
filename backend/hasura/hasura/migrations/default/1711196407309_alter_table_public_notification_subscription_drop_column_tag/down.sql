comment on column "public"."notification_subscription"."tag" is E'notification subscriptions metadata for client';
alter table "public"."notification_subscription" alter column "tag" drop not null;
alter table "public"."notification_subscription" add column "tag" text;
