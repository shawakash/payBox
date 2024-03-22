CREATE TABLE "public"."notification_subscription" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "auth" text NOT NULL, "endpoint" text NOT NULL, "expirationTime" timestamptz, "p256dh" text NOT NULL, "public_key" text NOT NULL, "clientId" uuid NOT NULL, "uuid" uuid NOT NULL, "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON UPDATE no action ON DELETE no action);COMMENT ON TABLE "public"."notification_subscription" IS E'notification subscriptions metadata for client';
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
CREATE TRIGGER "set_public_notification_subscription_updated_at"
BEFORE UPDATE ON "public"."notification_subscription"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_notification_subscription_updated_at" ON "public"."notification_subscription" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
