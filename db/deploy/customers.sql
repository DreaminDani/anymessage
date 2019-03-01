-- Deploy anymessage:customers to pg
-- requires: teams

BEGIN;

ALTER TABLE "teams"
ADD "customer_id" character varying NULL;

COMMIT;
