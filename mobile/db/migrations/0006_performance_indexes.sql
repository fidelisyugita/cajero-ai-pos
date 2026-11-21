CREATE INDEX IF NOT EXISTS `idx_products_category_id` ON `products` (`category_id`);
CREATE INDEX IF NOT EXISTS `idx_products_deleted_at` ON `products` (`deleted_at`);
CREATE INDEX IF NOT EXISTS `idx_products_name` ON `products` (`name`);
CREATE INDEX IF NOT EXISTS `idx_transactions_created_at` ON `transactions` (`created_at` DESC);
CREATE INDEX IF NOT EXISTS `idx_transactions_is_synced` ON `transactions` (`is_synced`);
CREATE INDEX IF NOT EXISTS `idx_transaction_items_transaction_id` ON `transaction_items` (`transaction_id`);
CREATE INDEX IF NOT EXISTS `idx_transaction_items_product_id` ON `transaction_items` (`product_id`);
