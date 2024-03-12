comment on column "public"."eth"."sepoliaEth" is E'eth address and token for client wallets';
alter table "public"."eth" alter column "sepoliaEth" set default 0.00;
alter table "public"."eth" alter column "sepoliaEth" drop not null;
alter table "public"."eth" add column "sepoliaEth" float8;
