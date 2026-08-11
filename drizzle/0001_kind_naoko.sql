CREATE INDEX `idx_attempts_user_created` ON `attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_materials_user_created` ON `materials` (`user_id`,`created_at`);