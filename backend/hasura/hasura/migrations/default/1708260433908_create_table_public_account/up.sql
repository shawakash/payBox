CREATE TABLE "public"."account" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "walletId" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("walletId") REFERENCES "public"."wallet"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));COMMENT ON TABLE "public"."account" IS E'accounts in a wallet';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
