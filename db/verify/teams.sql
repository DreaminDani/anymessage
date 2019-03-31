-- Verify anymessage:teams on pg

BEGIN;

SELECT "id", "subdomain", "created_at", "updated_at"
  FROM teams
  WHERE FALSE;

select tgname
  from pg_trigger
  where not tgisinternal
  and tgname = 'teams_bu';

SELECT "id", "team_id", "user_id", "created_at", "updated_at"
  FROM teams_by_user
  WHERE FALSE;

select tgname
  from pg_trigger
  where not tgisinternal
  and tgname = 'teams_by_user_bu';

SELECT "team_id"
  FROM conversations
  WHERE FALSE;

ROLLBACK;
