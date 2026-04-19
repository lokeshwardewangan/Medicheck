CREATE TYPE "public"."member_relation" AS ENUM('self', 'spouse', 'child', 'parent', 'sibling', 'other');--> statement-breakpoint
CREATE TYPE "public"."member_sex" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TABLE "household" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'My household' NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"name" text NOT NULL,
	"relation" "member_relation" DEFAULT 'self' NOT NULL,
	"age" integer,
	"sex" "member_sex",
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"existing_conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"medications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blood_type" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_profile_member_id_unique" UNIQUE("member_id")
);
--> statement-breakpoint
ALTER TABLE "household" ADD CONSTRAINT "household_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profile" ADD CONSTRAINT "member_profile_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Row-Level Security policies.
-- Application code MUST wrap user-scoped queries with `withUserContext(userId, ...)`
-- (see src/server/db/with-user-context.ts) which sets `app.user_id` for the
-- transaction. Without it, these policies return zero rows.
ALTER TABLE "household" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "household" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "household_owner_access" ON "household"
  FOR ALL
  USING ("owner_id" = current_setting('app.user_id', true))
  WITH CHECK ("owner_id" = current_setting('app.user_id', true));--> statement-breakpoint

ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "member_household_access" ON "member"
  FOR ALL
  USING ("household_id" IN (SELECT "id" FROM "household" WHERE "owner_id" = current_setting('app.user_id', true)))
  WITH CHECK ("household_id" IN (SELECT "id" FROM "household" WHERE "owner_id" = current_setting('app.user_id', true)));--> statement-breakpoint

ALTER TABLE "member_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member_profile" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "member_profile_access" ON "member_profile"
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
  ));