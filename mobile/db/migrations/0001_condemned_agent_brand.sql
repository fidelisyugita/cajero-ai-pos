CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`accessToken` text NOT NULL,
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `users` ADD `password` text NOT NULL;