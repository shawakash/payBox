alter table "public"."eth"
  add constraint "eth_clientId_fkey"
  foreign key ("clientId")
  references "public"."client"
  ("id") on update restrict on delete restrict;
