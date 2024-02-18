alter table "public"."bitcoin"
  add constraint "bitcoin_accountId_fkey"
  foreign key ("accountId")
  references "public"."account"
  ("id") on update restrict on delete restrict;
