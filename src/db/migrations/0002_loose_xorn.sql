CREATE TYPE "public"."assessment_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."triage_feedback" AS ENUM('helpful', 'not_helpful');--> statement-breakpoint
CREATE TYPE "public"."triage_level" AS ENUM('emergency', 'urgent', 'routine', 'self_care');--> statement-breakpoint
CREATE TABLE "assessment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "assessment_status" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assessment_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"is_emergency" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_up_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symptom_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"name" text NOT NULL,
	"body_part" text,
	"severity" integer NOT NULL,
	"duration" text NOT NULL,
	"description" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "triage_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"level" "triage_level" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"explanation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disclaimer" text NOT NULL,
	"feedback" "triage_feedback",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "triage_result_assessment_id_unique" UNIQUE("assessment_id")
);
--> statement-breakpoint
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_message" ADD CONSTRAINT "assessment_message_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_answer" ADD CONSTRAINT "follow_up_answer_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptom_entry" ADD CONSTRAINT "symptom_entry_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triage_result" ADD CONSTRAINT "triage_result_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Row-Level Security: scope every assessment-related row to the owning household.
ALTER TABLE "assessment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assessment" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "assessment_household_access" ON "assessment"
  FOR ALL
  USING ("member_id" IN (
    SELECT m."id" FROM "member" m
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ))
  WITH CHECK ("member_id" IN (
    SELECT m."id" FROM "member" m
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ));--> statement-breakpoint

ALTER TABLE "assessment_message" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assessment_message" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "assessment_message_household_access" ON "assessment_message"
  FOR ALL
  USING ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ))
  WITH CHECK ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ));--> statement-breakpoint

ALTER TABLE "symptom_entry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "symptom_entry" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "symptom_entry_household_access" ON "symptom_entry"
  FOR ALL
  USING ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ))
  WITH CHECK ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ));--> statement-breakpoint

ALTER TABLE "follow_up_answer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "follow_up_answer" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "follow_up_answer_household_access" ON "follow_up_answer"
  FOR ALL
  USING ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ))
  WITH CHECK ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ));--> statement-breakpoint

ALTER TABLE "triage_result" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "triage_result" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "triage_result_household_access" ON "triage_result"
  FOR ALL
  USING ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ))
  WITH CHECK ("assessment_id" IN (
    SELECT a."id" FROM "assessment" a
    JOIN "member" m ON a."member_id" = m."id"
    JOIN "household" h ON m."household_id" = h."id"
    WHERE h."owner_id" = current_setting('app.user_id', true)
  ));