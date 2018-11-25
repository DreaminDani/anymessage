-- Revert anymessage:conversations from pg

BEGIN;

DROP TABLE "conversations"; -- also drops the trigger

COMMIT;
