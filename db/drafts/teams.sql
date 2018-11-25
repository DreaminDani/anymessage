CREATE TABLE "teams" (
  "id" serial NOT NULL,
  "subdomain" character varying NOT NULL
);

ALTER TABLE "users"
ADD "team_id" integer NULL;
COMMENT ON TABLE "users" IS '';

ALTER TABLE "conversations"
ADD "team_id" integer NOT NULL;
COMMENT ON TABLE "conversations" IS '';
