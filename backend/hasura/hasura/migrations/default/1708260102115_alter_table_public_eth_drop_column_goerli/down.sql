comment on column "public"."eth"."goerli" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_goerli_key" unique (goerli);
alter table "public"."eth" alter column "goerli" drop not null;
alter table "public"."eth" add column "goerli" text;
