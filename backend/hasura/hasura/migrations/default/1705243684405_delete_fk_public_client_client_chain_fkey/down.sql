alter table "public"."client"
  add constraint "client_chain_fkey"
  foreign key ("chain")
  references "public"."chain"
  ("id") on update restrict on delete restrict;
