CREATE TABLE "public"."notification" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "body" text NOT NULL, "image" text, "timestamp" Timestamp NOT NULL DEFAULT now(), "title" text NOT NULL, "clientId" uuid NOT NULL, "viewed" boolean NOT NULL, "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON UPDATE no action ON DELETE no action, UNIQUE ("id"));COMMENT ON TABLE "public"."notification" IS E'notification table for clients';
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
CREATE TRIGGER "set_public_notification_updated_at"
BEFORE UPDATE ON "public"."notification"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_notification_updated_at" ON "public"."notification" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
