alter table "public"."wallet"
  add constraint "wallet_sol_fkey"
  foreign key ("sol")
  references "public"."sol"
  ("id") on update restrict on delete restrict;
