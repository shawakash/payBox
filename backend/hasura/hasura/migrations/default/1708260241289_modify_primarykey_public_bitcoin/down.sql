alter table "public"."bitcoin" drop constraint "bitcoin_pkey";
alter table "public"."bitcoin"
    add constraint "bitcoin_pkey"
    primary key ("id", "walletId", "clientId");
