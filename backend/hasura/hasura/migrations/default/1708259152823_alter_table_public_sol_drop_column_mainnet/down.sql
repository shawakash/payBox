comment on column "public"."sol"."mainnet" is E'solana address for client wallets';
alter table "public"."sol" add constraint "sol_mainnet_key" unique (mainnet);
alter table "public"."sol" alter column "mainnet" drop not null;
alter table "public"."sol" add column "mainnet" text;
