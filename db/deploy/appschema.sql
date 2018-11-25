-- Deploy appschema
BEGIN;

CREATE SCHEMA anymessage;

CREATE FUNCTION "update_changetimestamp_column" () RETURNS trigger LANGUAGE plpgsql AS '
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
';

COMMIT;