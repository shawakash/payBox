alter table "public"."sol"
  add constraint "sol_clientId_fkey"
  foreign key ("clientId")
  references "public"."client"
  ("id") on update restrict on delete restrict;
