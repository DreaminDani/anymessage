CREATE TABLE "conversations" (
  "id" serial NOT NULL,
  "from" character varying NOT NULL,
  "to" character varying NOT NULL,
  "history" jsonb NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);




CREATE FUNCTION "update_changetimestamp_column" () RETURNS trigger LANGUAGE plpgsql AS '
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
'




DELIMITER ;;
CREATE TRIGGER "conversations_bu" BEFORE UPDATE ON "conversations" FOR EACH ROW
EXECUTE PROCEDURE update_changetimestamp_column();;
DELIMITER ;