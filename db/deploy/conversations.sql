-- Deploy anymessage:conversations to pg

BEGIN;

CREATE TABLE "conversations" (
  "id" serial PRIMARY KEY,
  "from" character varying NOT NULL,
  "to" character varying NOT NULL,
  "history" jsonb NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER "conversations_bu" BEFORE UPDATE ON "conversations" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();

COMMIT;
