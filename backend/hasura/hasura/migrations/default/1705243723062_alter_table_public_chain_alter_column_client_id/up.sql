alter table "public"."chain" alter column "client_id" set not null;
alter table "public"."chain" add constraint "chain_client_id_key" unique ("client_id");
