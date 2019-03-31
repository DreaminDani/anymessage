-- Revert anymessage:teams from pg

BEGIN;

DROP TABLE "teams";

ALTER TABLE "conversations"
DROP COLUMN "team_id";

COMMIT;
