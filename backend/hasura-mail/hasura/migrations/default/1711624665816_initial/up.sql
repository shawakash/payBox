SET check_function_bodies = false;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.custom_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    address text NOT NULL,
    description text NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.custom_address IS 'custom address for paybox';
CREATE TABLE public.mails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    from_address text NOT NULL,
    to_address text NOT NULL,
    subject text NOT NULL,
    text_content text NOT NULL,
    html_content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date timestamp with time zone NOT NULL
);
COMMENT ON TABLE public.mails IS 'mails from clients';
ALTER TABLE ONLY public.custom_address
    ADD CONSTRAINT custom_address_address_key UNIQUE (address);
ALTER TABLE ONLY public.custom_address
    ADD CONSTRAINT custom_address_key_key UNIQUE (key);
ALTER TABLE ONLY public.custom_address
    ADD CONSTRAINT custom_address_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.mails
    ADD CONSTRAINT mails_pkey PRIMARY KEY (id);
CREATE TRIGGER set_public_custom_address_updated_at BEFORE UPDATE ON public.custom_address FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_custom_address_updated_at ON public.custom_address IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_public_mails_updated_at BEFORE UPDATE ON public.mails FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_mails_updated_at ON public.mails IS 'trigger to set value of column "updated_at" to current timestamp on row update';
