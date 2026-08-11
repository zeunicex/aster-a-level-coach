CREATE TABLE `admins` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_packs` (
	`pack_order` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`release_note` text DEFAULT '' NOT NULL,
	`updated_by` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_packs_name_unique` ON `content_packs` (`name`);--> statement-breakpoint
CREATE TABLE `pack_releases` (
	`id` text PRIMARY KEY NOT NULL,
	`pack_order` integer NOT NULL,
	`version` integer NOT NULL,
	`status` text NOT NULL,
	`release_note` text DEFAULT '' NOT NULL,
	`changed_by` text NOT NULL,
	`changed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pack_releases_order_changed` ON `pack_releases` (`pack_order`,`changed_at`);