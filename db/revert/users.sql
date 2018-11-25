-- Revert anymessage:users from pg

BEGIN;

DROP TABLE "users";

COMMIT;
