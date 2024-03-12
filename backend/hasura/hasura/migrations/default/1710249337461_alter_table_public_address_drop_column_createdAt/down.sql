comment on column "public"."address"."createdAt" is E'different chain and there address';
alter table "public"."address" alter column "createdAt" set default now();
alter table "public"."address" alter column "createdAt" drop not null;
alter table "public"."address" add column "createdAt" timestamp;
