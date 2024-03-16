CREATE TABLE "public"."friendships" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "clientId1" uuid NOT NULL, "clientId2" uuid NOT NULL, "status" text NOT NULL DEFAULT 'pending', "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("clientId1") REFERENCES "public"."client"("id") ON UPDATE no action ON DELETE no action, FOREIGN KEY ("clientId2") REFERENCES "public"."client"("id") ON UPDATE no action ON DELETE no action, UNIQUE ("id"));COMMENT ON TABLE "public"."friendships" IS E'rooms table for clients';
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
CREATE TRIGGER "set_public_friendships_updated_at"
BEFORE UPDATE ON "public"."friendships"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_friendships_updated_at" ON "public"."friendships" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
