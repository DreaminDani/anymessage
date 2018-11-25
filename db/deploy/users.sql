-- Deploy anymessage:users to pg
-- requires: appschema

BEGIN;

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "auth_provider" character varying NOT NULL,
  "auth_metadata" jsonb NOT NULL,
  "name" character varying NOT NULL,
  "email" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER "users_bu" BEFORE UPDATE ON "users" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();

COMMIT;
