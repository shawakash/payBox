alter table "public"."sol"
  add constraint "sol_walletId_fkey"
  foreign key ("walletId")
  references "public"."wallet"
  ("id") on update restrict on delete restrict;
