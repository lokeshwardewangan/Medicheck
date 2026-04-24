CREATE TYPE "public"."ai_call_status" AS ENUM('success', 'error', 'fallback');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'read', 'update', 'delete');--> statement-breakpoint
CREATE TABLE "ai_call" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"feature" text NOT NULL,
	"model" text NOT NULL,
	"prompt_hash" text NOT NULL,
	"tokens_in" integer,
	"tokens_out" integer,
	"latency_ms" integer NOT NULL,
	"cache_hit" boolean DEFAULT false NOT NULL,
	"fallback_used" boolean DEFAULT false NOT NULL,
	"status" "ai_call_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_call" ADD CONSTRAINT "ai_call_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;