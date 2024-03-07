alter table "public"."transactions" drop constraint "transactions_client_id_fkey",
  add constraint "transactions_clientId_fkey"
  foreign key ("clientId")
  references "public"."client"
  ("id") on update restrict on delete restrict;
