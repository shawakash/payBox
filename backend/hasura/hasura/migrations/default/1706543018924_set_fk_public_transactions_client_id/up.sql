alter table "public"."transactions"
  add constraint "transactions_client_id_fkey"
  foreign key ("client_id")
  references "public"."client"
  ("id") on update restrict on delete restrict;
