alter table "public"."eth"
  add constraint "eth_walletId_fkey"
  foreign key ("walletId")
  references "public"."wallet"
  ("id") on update restrict on delete restrict;
