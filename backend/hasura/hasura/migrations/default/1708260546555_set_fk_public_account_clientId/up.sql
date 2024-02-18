alter table "public"."account"
  add constraint "account_clientId_fkey"
  foreign key ("clientId")
  references "public"."client"
  ("id") on update restrict on delete restrict;
