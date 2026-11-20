CREATE TABLE "event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"type" text NOT NULL,
	"actor" text NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "event_entity_idx" ON "event" USING btree ("entity_type","entity_id");