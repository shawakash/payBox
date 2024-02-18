alter table "public"."bitcoin" add constraint "bitcoin_walletId_key" unique ("walletId");
alter table "public"."bitcoin" rename column "walletId" to "accountId";
