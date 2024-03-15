CREATE TABLE "public"."channel" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "clientId1" uuid NOT NULL, "clientId2" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("clientId1"), UNIQUE ("clientId2"));COMMENT ON TABLE "public"."channel" IS E'all the rooms for chat';
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_channel_updated_at"
BEFORE UPDATE ON "public"."channel"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_channel_updated_at" ON "public"."channel" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
