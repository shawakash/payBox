comment on column "public"."bitcoin"."mainnet" is E'bticoin address for client wallets';
alter table "public"."bitcoin" add constraint "bitcoin_mainnet_key" unique (mainnet);
alter table "public"."bitcoin" alter column "mainnet" drop not null;
alter table "public"."bitcoin" add column "mainnet" text;
