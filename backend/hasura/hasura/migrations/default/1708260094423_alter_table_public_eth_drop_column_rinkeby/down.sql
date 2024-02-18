comment on column "public"."eth"."rinkeby" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_rinkeby_key" unique (rinkeby);
alter table "public"."eth" alter column "rinkeby" drop not null;
alter table "public"."eth" add column "rinkeby" text;
