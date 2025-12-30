CREATE TABLE IF NOT EXISTS `product_ingredients` (
	`product_id` text NOT NULL,
	`ingredient_id` text NOT NULL,
	`name` text,
	`stock` integer,
	`measure_unit_code` text,
	`measure_unit_name` text,
	`quantity_needed` integer
);
