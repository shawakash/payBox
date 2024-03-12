CREATE TRIGGER "set_public_account_updated_at"
BEFORE UPDATE ON "public"."account"
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();COMMENT ON TRIGGER "set_public_account_updated_at" ON "public"."account"
IS E'trigger to set value of column "updated_at" to current timestamp on row update';
