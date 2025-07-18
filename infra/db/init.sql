
-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  image_url VARCHAR(255),
  description TEXT,
  location JSONB,
  bank_account VARCHAR(50),
  bank_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Table: roles
CREATE TABLE roles (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role_code VARCHAR(20),
  image_url VARCHAR(255),
  address TEXT,
  description TEXT,
  bank_account VARCHAR(50),
  bank_no VARCHAR(50),
  daily_salary DECIMAL(10,2),
  overtime_rate DECIMAL(10,2),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (role_code) REFERENCES roles(code)
);

-- Table: attendances
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  image_url VARCHAR(255),
  is_in BOOLEAN NOT NULL,
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: product_categories
CREATE TABLE product_categories (
  code VARCHAR(10) PRIMARY KEY,
  store_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: measure_units
CREATE TABLE measure_units (
  code VARCHAR(10) PRIMARY KEY,
  store_id UUID,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  category_code VARCHAR(10),
  name VARCHAR(100) NOT NULL,
  image_url VARCHAR(255),
  measure_unit_code VARCHAR(10),
  note TEXT,
  buying_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reject_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  commission_by_percent BOOLEAN DEFAULT FALSE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (category_code) REFERENCES product_categories(code),
  FOREIGN KEY (measure_unit_code) REFERENCES measure_units(code)
);

-- Table: variants
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  is_multiple BOOLEAN DEFAULT FALSE,
  options JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Table: product_variants
CREATE TABLE product_variants (
  product_id UUID,
  variant_id UUID,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  stock_quantity INT DEFAULT 0,
  PRIMARY KEY (product_id, variant_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
);

-- Table: transaction_types
CREATE TABLE transaction_types (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- Table: payment_methods
CREATE TABLE payment_methods (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- Table: transaction_statuses
CREATE TABLE transaction_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

-- Table: transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  total_tax DECIMAL(10,2) DEFAULT 0,
  total_discount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  status_code VARCHAR(20),
  transaction_type_code VARCHAR(20),
  payment_method_code VARCHAR(20),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (status_code) REFERENCES transaction_statuses(code),
  FOREIGN KEY (transaction_type_code) REFERENCES transaction_types(code),
  FOREIGN KEY (payment_method_code) REFERENCES payment_methods(code),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table: transaction_items
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID,
  product_id UUID,
  selected_variants JSONB,
  note TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  buying_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0,
  commission_by_percent BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: petty_cash
CREATE TABLE petty_cash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  is_income BOOLEAN NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Recommended indexes
CREATE INDEX idx_created_by ON products(created_by);
CREATE INDEX idx_updated_by ON products(updated_by);
CREATE INDEX idx_created_by_transactions ON transactions(created_by);
CREATE INDEX idx_updated_by_transactions ON transactions(updated_by);
CREATE INDEX idx_created_by_variants ON variants(created_by);
CREATE INDEX idx_updated_by_variants ON variants(updated_by);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_variant ON product_variants(variant_id);
