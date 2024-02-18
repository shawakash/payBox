BEGIN TRANSACTION;
ALTER TABLE "public"."bitcoin" DROP CONSTRAINT "bitcoin_pkey";

ALTER TABLE "public"."bitcoin"
    ADD CONSTRAINT "bitcoin_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;
