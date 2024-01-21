alter table "public"."address"
  add constraint "address_client_id_fkey"
  foreign key ("client_id")
  references "public"."client"
  ("id") on update restrict on delete restrict;
