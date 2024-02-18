alter table "public"."eth"
  add constraint "eth_accountId_fkey"
  foreign key ("accountId")
  references "public"."account"
  ("id") on update restrict on delete restrict;
