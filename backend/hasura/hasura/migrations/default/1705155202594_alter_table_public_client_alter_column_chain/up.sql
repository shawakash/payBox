alter table "public"."client" alter column "chain" set default jsonb_build_object();
alter table "public"."client" alter column "chain" set not null;
