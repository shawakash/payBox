comment on column "public"."eth"."ropsten" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_ropsten_key" unique (ropsten);
alter table "public"."eth" alter column "ropsten" drop not null;
alter table "public"."eth" add column "ropsten" text;
