comment on column "public"."eth"."kovan" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_kovan_key" unique (kovan);
alter table "public"."eth" alter column "kovan" drop not null;
alter table "public"."eth" add column "kovan" text;
