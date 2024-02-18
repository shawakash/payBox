comment on column "public"."bitcoin"."regtest" is E'bticoin address for client wallets';
alter table "public"."bitcoin" add constraint "bitcoin_regtest_key" unique (regtest);
alter table "public"."bitcoin" alter column "regtest" drop not null;
alter table "public"."bitcoin" add column "regtest" text;
