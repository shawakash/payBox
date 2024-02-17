comment on column "public"."wallet"."usdc" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_usdc_key" unique (usdc);
alter table "public"."wallet" alter column "usdc" drop not null;
alter table "public"."wallet" add column "usdc" uuid;
