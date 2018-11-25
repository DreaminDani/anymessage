-- Revert anymessage:teams from pg

BEGIN;

DROP TABLE "teams";

ALTER TABLE "users"
DROP COLUMN "team_id";

ALTER TABLE "conversations"
DROP COLUMN "team_id";

COMMIT;
