-- Remove redundant index on surveys.slug since UNIQUE constraint already creates an index
DROP INDEX IF EXISTS "surveys_slug_idx";
--> statement-breakpoint

-- Convert survey_responses timestamp columns to timestamptz
ALTER TABLE "survey_responses" 
  ALTER COLUMN "completed_at" TYPE timestamptz USING "completed_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "survey_responses" 
  ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "survey_responses" 
  ALTER COLUMN "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';
--> statement-breakpoint


-- Convert surveys timestamp columns to timestamptz
ALTER TABLE "surveys" 
  ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "surveys" 
  ALTER COLUMN "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "surveys" 
  ALTER COLUMN "published_at" TYPE timestamptz USING "published_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "surveys" 
  ALTER COLUMN "closed_at" TYPE timestamptz USING "closed_at" AT TIME ZONE 'UTC';
--> statement-breakpoint
ALTER TABLE "surveys" 
  ALTER COLUMN "deleted_at" TYPE timestamptz USING "deleted_at" AT TIME ZONE 'UTC';
--> statement-breakpoint

-- Change survey_responses.survey_id FK from ON DELETE CASCADE to ON DELETE RESTRICT
-- to prevent hard-deletes of responses when surveys are soft-deleted
ALTER TABLE "survey_responses" 
  DROP CONSTRAINT IF EXISTS "survey_responses_survey_id_surveys_id_fk";
--> statement-breakpoint
ALTER TABLE "survey_responses" 
  ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" 
  FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") 
  ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint
