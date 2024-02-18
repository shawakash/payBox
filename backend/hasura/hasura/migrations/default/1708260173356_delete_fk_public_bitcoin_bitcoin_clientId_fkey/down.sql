alter table "public"."bitcoin"
  add constraint "bitcoin_clientId_fkey"
  foreign key ("clientId")
  references "public"."client"
  ("id") on update restrict on delete restrict;
