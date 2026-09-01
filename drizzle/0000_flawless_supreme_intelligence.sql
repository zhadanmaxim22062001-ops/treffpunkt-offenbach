CREATE TYPE "public"."radar_category" AS ENUM('rathaus', 'baustelle', 'foerderung', 'frequenz', 'stadt', 'recht');--> statement-breakpoint
CREATE TYPE "public"."radar_origin" AS ENUM('feed', 'manual');--> statement-breakpoint
CREATE TYPE "public"."radar_status" AS ENUM('draft', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."radar_urgency" AS ENUM('low', 'mid', 'high');--> statement-breakpoint
CREATE TABLE "digest_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"confirm_token" text NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	CONSTRAINT "digest_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "digest_subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "ingest_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"items_fetched" integer DEFAULT 0 NOT NULL,
	"items_new" integer DEFAULT 0 NOT NULL,
	"items_classified" integer DEFAULT 0 NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" numeric(10, 4) DEFAULT '0' NOT NULL,
	"capped_at" boolean DEFAULT false NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_hash" text NOT NULL,
	"origin" "radar_origin" NOT NULL,
	"source_id" integer,
	"status" "radar_status" DEFAULT 'draft' NOT NULL,
	"category" "radar_category" NOT NULL,
	"audience" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"streets" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"urgency" "radar_urgency" DEFAULT 'mid' NOT NULL,
	"deadline" date,
	"headline_de" text NOT NULL,
	"summary_de" text NOT NULL,
	"action_de" text NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"feed_url" text NOT NULL,
	"licence_note" text,
	"active" boolean DEFAULT true NOT NULL,
	"last_fetched_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_status_idx" ON "items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "items_public_list_idx" ON "items" USING btree ("status","category","published_at");