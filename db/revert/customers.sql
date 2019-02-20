-- Revert anymessage:customers from pg

BEGIN;

ALTER TABLE "teams"
DROP "customer_id";

COMMIT;
