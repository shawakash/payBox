alter table "public"."chat"
  add constraint "chat_friendshipId_fkey"
  foreign key ("friendshipId")
  references "public"."friendship"
  ("id") on update no action on delete no action;
