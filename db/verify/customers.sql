-- Verify anymessage:customers on pg

BEGIN;

SELECT "customer_id"
  FROM teams
  WHERE FALSE;

ROLLBACK;
