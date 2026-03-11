CREATE TYPE "public"."season_status" AS ENUM('RECRUITING', 'ACTIVE', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."application_field" AS ENUM('FRONTEND', 'BACKEND', 'ANDROID', 'IOS', 'DESIGN', 'PM');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('RECEIVED', 'INTERVIEW', 'PASSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."member_team" AS ENUM('WEB_1', 'WEB_2', 'ANDROID_1', 'ANDROID_2', 'IOS_1', 'IOS_2');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('PRESIDENT', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."interview_result" AS ENUM('PENDING', 'PASS', 'FAIL');--> statement-breakpoint
CREATE TYPE "public"."notice_target" AS ENUM('ALL', 'MEMBER');--> statement-breakpoint
CREATE TABLE "season" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"recruit_start" date NOT NULL,
	"recruit_end" date NOT NULL,
	"activity_start" date NOT NULL,
	"activity_end" date NOT NULL,
	"status" "season_status" DEFAULT 'RECRUITING' NOT NULL,
	CONSTRAINT "season_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"field" "application_field" NOT NULL,
	"status" "application_status" DEFAULT 'RECEIVED' NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb,
	"portfolio_file_url" text,
	"reference_urls" text[] DEFAULT '{}'::text[]
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid,
	"season_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"team" "member_team",
	"is_active" boolean DEFAULT true NOT NULL,
	"discord_id" text,
	CONSTRAINT "member_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"role" "admin_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"google_event_id" text,
	"score" integer,
	"memo" text,
	"result" "interview_result" DEFAULT 'PENDING' NOT NULL,
	"interviewed_by" uuid,
	CONSTRAINT "interview_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "notice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"target" "notice_target" DEFAULT 'ALL' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview" ADD CONSTRAINT "interview_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice" ADD CONSTRAINT "notice_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE no action ON UPDATE no action;