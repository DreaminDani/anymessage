-- Verify anymessage:providers on pg

BEGIN;

SELECT "id", "name", "team_id", "authentication", "providers", "created_at", "updated_at"
  FROM integrations
  WHERE FALSE;

select tgname
    from pg_trigger
    where not tgisinternal
    and tgname = 'integrations_bu';

ROLLBACK;
