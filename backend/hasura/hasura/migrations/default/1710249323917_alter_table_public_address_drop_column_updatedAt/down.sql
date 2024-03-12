comment on column "public"."address"."updatedAt" is E'different chain and there address';
alter table "public"."address" alter column "updatedAt" set default now();
alter table "public"."address" alter column "updatedAt" drop not null;
alter table "public"."address" add column "updatedAt" timestamp;
