CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`subject` text NOT NULL,
	`objective_code` text NOT NULL,
	`correct` integer NOT NULL,
	`confidence` text NOT NULL,
	`used_hint` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`delta` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mastery` (
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`code` text NOT NULL,
	`topic` text NOT NULL,
	`score` integer DEFAULT 50 NOT NULL,
	`evidence` integer DEFAULT 0 NOT NULL,
	`confidence` text DEFAULT 'Low' NOT NULL,
	`knowledge` integer DEFAULT 50 NOT NULL,
	`application` integer DEFAULT 50 NOT NULL,
	`exam` integer DEFAULT 50 NOT NULL,
	`note` text DEFAULT 'Not assessed yet' NOT NULL,
	`due` text DEFAULT 'Today' NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `subject`, `code`)
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`object_key` text NOT NULL,
	`status` text DEFAULT 'Stored' NOT NULL,
	`pages` integer,
	`created_at` text NOT NULL
);
