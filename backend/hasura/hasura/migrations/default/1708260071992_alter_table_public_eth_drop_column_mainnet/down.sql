comment on column "public"."eth"."mainnet" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_mainnet_key" unique (mainnet);
alter table "public"."eth" alter column "mainnet" drop not null;
alter table "public"."eth" add column "mainnet" text;
