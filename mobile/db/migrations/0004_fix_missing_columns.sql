ALTER TABLE `products` ADD `measure_unit_code` text;--> statement-breakpoint
ALTER TABLE `products` ADD `measure_unit_name` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `description` text;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `buying_price` integer;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `tax` integer;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `commission` integer;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `discount` integer;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `note` text;--> statement-breakpoint
ALTER TABLE `transaction_items` ADD `selected_variants` text;--> statement-breakpoint
ALTER TABLE `transaction_items` RENAME COLUMN `price` TO `selling_price`;--> statement-breakpoint
CREATE TABLE `product_ingredients` (
	`product_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`name` text,
	`stock` integer,
	`measure_unit_code` text,
	`measure_unit_name` text,
	`quantity_needed` integer
);
