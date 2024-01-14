alter table "public"."chain" drop constraint "chain_client_id_key";
alter table "public"."chain" alter column "client_id" drop not null;
