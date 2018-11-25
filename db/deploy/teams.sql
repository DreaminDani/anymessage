-- Deploy anymessage:teams to pg
-- requires: users
-- requires: conversations

BEGIN;

CREATE TABLE "teams" (
  "id" serial PRIMARY KEY,
  "subdomain" character varying NOT NULL UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER "teams_bu" BEFORE UPDATE ON "teams" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();

ALTER TABLE "users"
ADD "team_id" integer NULL;
COMMENT ON TABLE "users" IS '';

ALTER TABLE "conversations"
ADD "team_id" integer NOT NULL;
COMMENT ON TABLE "conversations" IS '';


COMMIT;
