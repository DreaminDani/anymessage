-- Revert anymessage:providers from pg

BEGIN;

DROP TABLE "integrations"; -- also drops the trigger

COMMIT;
