alter table "public"."bitcoin"
  add constraint "bitcoin_walletId_fkey"
  foreign key ("walletId")
  references "public"."wallet"
  ("id") on update restrict on delete restrict;
