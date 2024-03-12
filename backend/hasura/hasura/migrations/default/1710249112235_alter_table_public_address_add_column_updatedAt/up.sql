alter table "public"."address" add column "updatedAt" Timestamp
 null default now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updatedAt"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updatedAt" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_address_updatedAt"
BEFORE UPDATE ON "public"."address"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_address_updatedAt" ON "public"."address" 
IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
