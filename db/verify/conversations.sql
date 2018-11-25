-- Verify anymessage:conversations on pg

BEGIN;

SELECT "id", "from", "to", "history", "created_at", "updated_at"
  FROM conversations
  WHERE FALSE;

select tgname
    from pg_trigger
    where not tgisinternal
    and tgname = 'conversations_bu';

ROLLBACK;
