comment on column "public"."sol"."clientId" is E'solana address for client wallets';
alter table "public"."sol" add constraint "sol_clientId_key" unique (clientId);
alter table "public"."sol" alter column "clientId" drop not null;
alter table "public"."sol" add column "clientId" uuid;
