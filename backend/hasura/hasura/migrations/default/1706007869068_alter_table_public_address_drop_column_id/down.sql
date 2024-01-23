comment on column "public"."address"."id" is E'different chain and there address';
alter table "public"."address" alter column "id" drop not null;
alter table "public"."address" add column "id" uuid;
