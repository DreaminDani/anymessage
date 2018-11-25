CREATE TABLE "users" (
  "id" serial NOT NULL,
  "auth_provider" character varying NOT NULL,
  "auth_metadata" jsonb NOT NULL,
  "name" character varying NOT NULL,
  "email" character varying NOT NULL;
);