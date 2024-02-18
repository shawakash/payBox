comment on column "public"."bitcoin"."clientId" is E'bticoin address for client wallets';
alter table "public"."bitcoin" alter column "clientId" drop not null;
alter table "public"."bitcoin" add column "clientId" uuid;
