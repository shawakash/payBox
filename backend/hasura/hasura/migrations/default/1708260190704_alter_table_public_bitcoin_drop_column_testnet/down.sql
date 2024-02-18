comment on column "public"."bitcoin"."testnet" is E'bticoin address for client wallets';
alter table "public"."bitcoin" add constraint "bitcoin_testnet_key" unique (testnet);
alter table "public"."bitcoin" alter column "testnet" drop not null;
alter table "public"."bitcoin" add column "testnet" text;
