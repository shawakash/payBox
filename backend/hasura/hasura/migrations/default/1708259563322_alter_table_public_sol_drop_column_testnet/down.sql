comment on column "public"."sol"."testnet" is E'solana address for client wallets';
alter table "public"."sol" add constraint "sol_testnet_key" unique (testnet);
alter table "public"."sol" alter column "testnet" drop not null;
alter table "public"."sol" add column "testnet" text;
