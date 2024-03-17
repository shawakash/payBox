alter table "public"."account" drop constraint "img_url";
alter table "public"."account" add constraint "img_url" check (img ~* '^(https?|ftp)://[^\s/$.?#].[^\s]*$'::text);
