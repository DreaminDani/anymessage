-- Revert appschema
BEGIN;

DROP FUNCTION "update_changetimestamp_column";
DROP SCHEMA anymessage;

COMMIT;