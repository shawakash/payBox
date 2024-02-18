alter table "public"."bitcoin" rename column "accountId" to "walletId";
alter table "public"."bitcoin" drop constraint "bitcoin_walletId_key";
