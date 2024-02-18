comment on column "public"."wallet"."privateKey" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_privateKey_key" unique (privateKey);
alter table "public"."wallet" alter column "privateKey" drop not null;
alter table "public"."wallet" add column "privateKey" text;
