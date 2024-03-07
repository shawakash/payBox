comment on column "public"."transactions"."nonce" is E'transactions table ';
alter table "public"."transactions" alter column "nonce" drop not null;
alter table "public"."transactions" add column "nonce" int4;
