alter table "public"."address" drop constraint "address_client_id_fkey",
  add constraint "address_client_id_fkey"
  foreign key ("client_id")
  references "public"."client"
  ("id") on update set null on delete set null;
