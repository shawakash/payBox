comment on column "public"."wallet"."bitcoin" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_bitcoin_key" unique (bitcoin);
alter table "public"."wallet" alter column "bitcoin" drop not null;
alter table "public"."wallet" add column "bitcoin" uuid;
