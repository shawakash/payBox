alter table "public"."sol"
  add constraint "sol_accountId_fkey"
  foreign key ("accountId")
  references "public"."account"
  ("id") on update restrict on delete restrict;
