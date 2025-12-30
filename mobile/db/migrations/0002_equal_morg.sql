CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` integer,
	`selling_price` integer,
	`buying_price` integer,
	`stock` integer,
	`category_id` text,
	`image_url` text,
	`barcode` text,
	`tax` integer,
	`commission` integer,
	`discount` integer,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `sync_status` (
	`table_name` text PRIMARY KEY NOT NULL,
	`last_sync` integer
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`product_name` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text,
	`customer_id` text,
	`total_price` integer,
	`total_tax` integer,
	`total_discount` integer,
	`payment_method_code` text,
	`status_code` text,
	`is_synced` integer DEFAULT false,
	`created_at` integer
);
