comment on column "public"."wallet"."eth" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_eth_key" unique (eth);
alter table "public"."wallet" alter column "eth" drop not null;
alter table "public"."wallet" add column "eth" uuid;
