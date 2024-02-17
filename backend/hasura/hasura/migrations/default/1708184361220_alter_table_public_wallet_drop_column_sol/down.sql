comment on column "public"."wallet"."sol" is E'wallets info for clients';
alter table "public"."wallet" add constraint "wallet_sol_key" unique (sol);
alter table "public"."wallet" alter column "sol" drop not null;
alter table "public"."wallet" add column "sol" uuid;
