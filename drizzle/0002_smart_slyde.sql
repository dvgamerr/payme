ALTER TABLE `fixed_expenses` ADD `currency` text DEFAULT 'THB' NOT NULL;--> statement-breakpoint
ALTER TABLE `fixed_expenses` ADD `exchange_rate` real DEFAULT 1 NOT NULL;