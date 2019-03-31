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

CREATE TABLE "teams_by_user" (
  "id" serial PRIMARY KEY,
  "team_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "teams_by_user_user_id" ON "teams_by_user" ("user_id");
CREATE INDEX "teams_by_user_team_id" ON "teams_by_user" ("team_id");

CREATE TRIGGER "teams_by_user_bu" BEFORE UPDATE ON "teams_by_user" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();

ALTER TABLE "conversations"
ADD "team_id" integer NOT NULL;
COMMENT ON TABLE "conversations" IS '';


COMMIT;
