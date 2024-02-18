comment on column "public"."eth"."clientId" is E'eth address and token for client wallets';
alter table "public"."eth" add constraint "eth_clientId_key" unique (clientId);
alter table "public"."eth" alter column "clientId" drop not null;
alter table "public"."eth" add column "clientId" uuid;
