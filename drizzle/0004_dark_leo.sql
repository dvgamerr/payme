CREATE TABLE `fixed_months` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`month_id` integer NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`month_id`) REFERENCES `months`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_fixed_months_user_month` ON `fixed_months` (`user_id`,`month_id`);--> statement-breakpoint
CREATE INDEX `idx_fixed_months_month` ON `fixed_months` (`month_id`);