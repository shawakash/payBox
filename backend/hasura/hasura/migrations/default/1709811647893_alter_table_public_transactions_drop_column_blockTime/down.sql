comment on column "public"."transactions"."blockTime" is E'transactions table ';
alter table "public"."transactions" add constraint "transactions_block_time_key" unique (blockTime);
alter table "public"."transactions" alter column "blockTime" drop not null;
alter table "public"."transactions" add column "blockTime" int8;
