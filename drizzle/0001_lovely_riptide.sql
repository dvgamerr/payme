CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`base_currency` text DEFAULT 'THB' NOT NULL,
	`currency_symbol` text DEFAULT '฿' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);--> statement-breakpoint
ALTER TABLE `fixed_expenses` ADD `frequency` text DEFAULT 'monthly' NOT NULL;