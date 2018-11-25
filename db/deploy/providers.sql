-- Deploy anymessage:providers to pg
-- requires: teams

BEGIN;

CREATE TABLE "integrations" (
  "id" serial PRIMARY KEY,
  "name" character varying NOT NULL,
  "team_id" integer NOT NULL,
  "authentication" jsonb NOT NULL,
  "providers" jsonb NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER "integrations_bu" BEFORE UPDATE ON "conversations" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();

COMMIT;
