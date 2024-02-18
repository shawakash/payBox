comment on column "public"."sol"."devnet" is E'solana address for client wallets';
alter table "public"."sol" add constraint "sol_devnet_key" unique (devnet);
alter table "public"."sol" alter column "devnet" drop not null;
alter table "public"."sol" add column "devnet" text;
