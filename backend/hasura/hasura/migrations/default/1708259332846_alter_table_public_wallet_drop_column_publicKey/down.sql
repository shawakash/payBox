comment on column "public"."wallet"."publicKey" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_publicKey_key" unique (publicKey);
alter table "public"."wallet" alter column "publicKey" drop not null;
alter table "public"."wallet" add column "publicKey" text;
