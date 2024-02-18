comment on column "public"."eth"."sepolia" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_sepolia_key" unique (sepolia);
alter table "public"."eth" alter column "sepolia" drop not null;
alter table "public"."eth" add column "sepolia" text;
