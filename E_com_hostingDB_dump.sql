-- =========================================================
-- Sarees For Naaris Master Database DDL & Seed Script
-- Schema Name: E_com_hostingDB
-- JPA Entities Aligned Execution Script
-- =========================================================

CREATE DATABASE IF NOT EXISTS E_com_hostingDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE E_com_hostingDB;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to avoid column mismatches from previous partial attempts
DROP TABLE IF EXISTS 
eviews;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS ddresses;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS productimages;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sub_category;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS 
efresh_tokens;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS otp_verification;
DROP TABLE IF EXISTS users;

-- 1. Create Core Master Tables matching Spring Boot Entities
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_verification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expiry_time DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_email_purpose (email, purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_reset_tokens (
    	oken_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
eset_token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE 
efresh_tokens (
    	oken_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
efresh_token VARCHAR(255) NOT NULL UNIQUE,
    expiry_time DATETIME NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    categoryimage VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sub_category (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    subcategory_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL DEFAULT 1,
    category_id INT NOT NULL,
    subcategory_id INT,
    	itle VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES sub_category(subcategory_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE productimages (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wishlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ddresses (
    ddress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ull_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    ddress_line1 VARCHAR(255) NOT NULL,
    ddress_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    ddress_type VARCHAR(20) DEFAULT 'Home',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    order_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    	otal_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ddress_snapshot TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    	otal_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME NOT NULL,
    changed_by_user_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE 
eviews (
    
eview_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id VARCHAR(255),
    
ating INT NOT NULL,
    comment TEXT,
    photo_urls TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    helpful_count INT NOT NULL DEFAULT 0,
    
eported_count INT NOT NULL DEFAULT 0,
    seller_reply TEXT,
    seller_replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Admin and Seller Users required for foreign key references
INSERT INTO users (user_id, username, email, password, 
ole, is_verified, is_active) VALUES
(1, 'admin', 'admin@sareesfornaaris.com', '.zE5aW7VwW2L0Q1ue1a4D5f6g7h8i9j0k1l2m3n4o5p6q', 'ADMIN', TRUE, TRUE),
(2, 'seller1', 'seller1@sareesfornaaris.com', '.zE5aW7VwW2L0Q1ue1a4D5f6g7h8i9j0k1l2m3n4o5p6q', 'SELLER', TRUE, TRUE);

-- 4. Insert Main Categories with exact ImageKit hosted URLs
INSERT INTO categories (category_id, category_name, categoryimage) VALUES
(1, 'Casual', 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193'),
(2, 'Traditional', 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/traditional.jpg?updatedAt=1785166625181'),
(3, 'Party', 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/party.webp?updatedAt=1785166624926'),
(4, 'Wedding', 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/marriages.jpeg?updatedAt=1785166624793');

-- 5. Insert Subcategories
INSERT INTO sub_category (subcategory_id, category_id, subcategory_name) VALUES
(1, 1, 'Georgette'),
(2, 1, 'Linen'),
(3, 1, 'Printed'),
(4, 1, 'Cotton'),
(5, 2, 'Chanderi'),
(6, 2, 'Paithani'),
(7, 2, 'Banarasi'),
(8, 2, 'Kanjivaram'),
(9, 3, 'Ruffle'),
(10, 3, 'Satin'),
(11, 3, 'Net'),
(12, 3, 'Sequin'),
(13, 4, 'Designer Bridal'),
(14, 4, 'Embroidered'),
(15, 4, 'Zari Work'),
(16, 4, 'Bridal Silk');

-- 6. Insert 72 Products
INSERT INTO products (product_id, seller_id, 	itle, description, price, stock_quantity, category_id, subcategory_id, created_at) VALUES
(1, 1, 'Wine Red Ruffle Party Saree', 'Chic pre-stitched ruffle saree with glamorous border detail.', 5999.00, 12, 3, 9, NOW()),
(2, 1, 'Midnight Black Ruffle Saree', 'Contemporary tiered ruffle design in soft georgette.', 6499.00, 8, 3, 9, NOW()),
(3, 1, 'Blush Pink Organza Ruffle Saree', 'Delicate pastel organza saree with flared ruffle hemline.', 5299.00, 15, 3, 9, NOW()),
(4, 1, 'Emerald Green Ruffle Drape', 'Vibrant ruffled cocktail saree with designer blouse piece.', 6899.00, 10, 3, 9, NOW()),

(5, 1, 'Rose Gold Liquid Satin Saree', 'Ultra-smooth shimmering satin saree with silky drape.', 4999.00, 20, 3, 10, NOW()),
(6, 1, 'Classic Emerald Satin Saree', 'Rich emerald satin saree crafted for evening galas.', 4599.00, 18, 3, 10, NOW()),
(7, 1, 'Sapphire Blue Satin Saree', 'Deep sapphire blue gloss satin saree with sleek border.', 4799.00, 14, 3, 10, NOW()),
(8, 1, 'Champagne Beige Satin Saree', 'Sophisticated champagne shade satin silk saree.', 5199.00, 16, 3, 10, NOW()),

(9, 1, 'Pastel Lavender Net Saree', 'Sheer designer net saree embellished with pearl border.', 7999.00, 9, 3, 11, NOW()),
(10, 1, 'Ivory Gold Net Saree', 'Ethereal net saree featuring fine floral thread embroidery.', 8499.00, 7, 3, 11, NOW()),
(11, 1, 'Crimson Red Sheer Net Saree', 'Stunning red net saree for festive cocktail parties.', 7299.00, 11, 3, 11, NOW()),
(12, 1, 'Royal Blue Embroidered Net Saree', 'Intricate blue net saree with sparkling border accents.', 8999.00, 6, 3, 11, NOW()),

(13, 1, 'Glamorous Gold Sequin Saree', 'Full sequin shimmer saree inspired by Bollywood red carpets.', 9999.00, 10, 3, 12, NOW()),
(14, 1, 'Silver Metallic Sequin Saree', 'Dazzling silver sequin work on soft georgette weave.', 10499.00, 5, 3, 12, NOW()),
(15, 1, 'Midnight Navy Sequin Saree', 'Dark blue midnight starry sequin saree with rich drape.', 9499.00, 8, 3, 12, NOW()),
(16, 1, 'Rose Violet Glam Sequin Saree', 'Vibrant magenta violet sequined party saree.', 9799.00, 12, 3, 12, NOW()),

(17, 1, 'Peach Floral Georgette Saree', 'Lightweight breathable georgette saree with digital floral prints.', 2499.00, 25, 1, 1, NOW()),
(18, 1, 'Sky Blue Georgette Daily Saree', 'Soft sky blue georgette saree for effortless daily wear.', 2199.00, 30, 1, 1, NOW()),
(19, 1, 'Mustard Yellow Bandhani Georgette', 'Vibrant mustard georgette with traditional bandhani print.', 2799.00, 22, 1, 1, NOW()),
(20, 1, 'Teal Green Printed Georgette', 'Refreshing teal green casual saree with geometric prints.', 2599.00, 28, 1, 1, NOW()),

(21, 1, 'Natural Beige Linen Saree', 'Pure eco-friendly breathable linen saree with silver zari border.', 3499.00, 20, 1, 2, NOW()),
(22, 1, 'Olive Green Linen Saree', 'Earth-toned handloom linen saree with contrast pallu.', 3899.00, 15, 1, 2, NOW()),
(23, 1, 'Coral Pink Organic Linen', 'Soft coral pink linen cotton blend saree for workwear elegance.', 3299.00, 18, 1, 2, NOW()),
(24, 1, 'Charcoal Grey Linen Saree', 'Sophisticated charcoal linen saree featuring hand-woven stripes.', 3699.00, 14, 1, 2, NOW()),

(25, 1, 'Multicolor Kalamkari Printed Saree', 'Artisanal Kalamkari block print casual saree.', 2999.00, 24, 1, 3, NOW()),
(26, 1, 'Indigo Block Printed Cotton Saree', 'Classic indigo blue Dabu block print on pure cotton.', 2699.00, 26, 1, 3, NOW()),
(27, 1, 'Terracotta Printed Casual Saree', 'Rustic terracotta shade printed saree with soft texture.', 2899.00, 19, 1, 3, NOW()),
(28, 1, 'Mint Botanical Print Saree', 'Soothing mint green casual saree adorned with botanical motifs.', 2749.00, 21, 1, 3, NOW()),

(29, 1, 'Mulmul Yellow Daily Cotton Saree', 'Ultra-soft handloom Mulmul cotton saree for summer comfort.', 1999.00, 35, 1, 4, NOW()),
(30, 1, 'Classic White Red Border Cotton', 'Traditional Bengali style white cotton saree with red border.', 2299.00, 40, 1, 4, NOW()),
(31, 1, 'Pastel Lavender Chettinad Cotton', 'Handwoven South Indian Chettinad cotton saree.', 2499.00, 25, 1, 4, NOW()),
(32, 1, 'Pista Green Handloom Cotton', 'Breathing light pista green cotton saree for daily office wear.', 1899.00, 32, 1, 4, NOW()),

(33, 1, 'Pastel Pink Tissue Chanderi Saree', 'Sheer golden tissue Chanderi saree with gold bootis.', 5499.00, 15, 2, 5, NOW()),
(34, 1, 'Mint Green Chanderi Silk Saree', 'Refreshing mint green Chanderi with hand-woven floral motifs.', 5899.00, 12, 2, 5, NOW()),
(35, 1, 'Golden Yellow Chanderi Saree', 'Radiant golden yellow Chanderi saree perfect for Haldi.', 6299.00, 10, 2, 5, NOW()),
(36, 1, 'Off-White Chanderi Cotton Saree', 'Elegant ivory off-white Chanderi saree with maroon zari border.', 4999.00, 18, 2, 5, NOW()),
(37, 1, 'Lavender Silver Zari Chanderi Saree', 'Contemporary lavender shade Chanderi woven with silver threads.', 5999.00, 14, 2, 5, NOW()),

(38, 1, 'Peacock Blue Royal Paithani Saree', 'Authentic hand-loomed peacock blue Paithani with pure zari border.', 24999.00, 5, 2, 6, NOW()),
(39, 1, 'Bright Yellow Maharani Paithani', 'Iconic yellow Paithani featuring rich multicolored lotus pallu.', 21999.00, 7, 2, 6, NOW()),
(40, 1, 'Magenta Silk Paithani Saree', 'Royal magenta Paithani saree with traditional gold zari weave.', 19999.00, 8, 2, 6, NOW()),
(41, 1, 'Dark Green Floral Border Paithani', 'Rich forest green silk Paithani adorned with peacock pallu art.', 23500.00, 6, 2, 6, NOW()),
(42, 1, 'Crimson Red Festive Paithani', 'Vibrant red Paithani saree for grand traditional rituals.', 25999.00, 4, 2, 6, NOW()),

(43, 1, 'Royal Red Banarasi Zari Silk', 'Exquisite handwoven crimson Banarasi silk saree with gold jaal.', 14999.00, 10, 2, 7, NOW()),
(44, 1, 'Gold Tissue Banarasi Brocade Saree', 'Stunning golden tissue Banarasi saree with silver-gold zari weave.', 16499.00, 8, 2, 7, NOW()),
(45, 1, 'Emerald Green Banarasi Silk Saree', 'Deep emerald green Katan silk saree with kadwa weave motifs.', 13800.00, 12, 2, 7, NOW()),
(46, 1, 'Pink Floral Jamdani Banarasi Saree', 'Delicate pastel pink Banarasi saree crafted with floral jamdani.', 11999.00, 15, 2, 7, NOW()),
(47, 1, 'Maroon Royal Brocade Banarasi Saree', 'Traditional bridal maroon saree embellished with dense gold zari.', 17999.00, 6, 2, 7, NOW()),

(48, 1, 'Classic Mustard Gold Kanjivaram', 'Authentic Kanjivaram silk saree in mustard gold with contrast border.', 18999.00, 9, 2, 8, NOW()),
(49, 1, 'Magenta Bridal Silk Kanjivaram', 'Pure zari woven magenta bridal saree featuring temple motifs.', 22500.00, 5, 2, 8, NOW()),
(50, 1, 'Royal Blue Korvai Kanjivaram', 'Classic royal blue Kanjivaram silk saree with traditional korvai border.', 16499.00, 11, 2, 8, NOW()),
(51, 1, 'Deep Crimson Temple Border Silk', 'Rich crimson red Kanjivaram saree with elegant zari temple design.', 19800.00, 7, 2, 8, NOW()),
(52, 1, 'Pastel Peach Zari Kanjivaram', 'Modern pastel peach silk Kanjivaram with subtle silver zari weaves.', 15999.00, 10, 2, 8, NOW()),

(53, 1, 'Bridal Scarlet Designer Saree', 'Heavy bridal crimson red saree with royal zardozi embroidery.', 28999.00, 4, 4, 13, NOW()),
(54, 1, 'Velvet Maroon Designer Bridal Saree', 'Opulent maroon velvet embroidered bridal saree with heavy border.', 32499.00, 3, 4, 13, NOW()),
(55, 1, 'Pastel Peach Designer Bridal Saree', 'Contemporary bridal pastel peach saree with sequin & stone work.', 26999.00, 6, 4, 13, NOW()),
(56, 1, 'Royal Crimson Designer Saree', 'Grand wedding red saree with intricate gold dabka embroidery.', 29999.00, 5, 4, 13, NOW()),
(57, 1, 'Golden Ivory Designer Bridal Saree', 'Regal golden ivory saree crafted for grand reception ceremonies.', 31000.00, 4, 4, 13, NOW()),

(58, 1, 'Heavy Embroidered Silk Saree', 'Intricately embroidered silk saree with gota patti detailing.', 18999.00, 8, 4, 14, NOW()),
(59, 1, 'Magenta Floral Embroidered Saree', 'Vibrant magenta wedding saree with dense thread & mirror work.', 16500.00, 10, 4, 14, NOW()),
(60, 1, 'Emerald Green Embroidered Saree', 'Deep green bridal saree embellished with resham embroidery.', 17999.00, 7, 4, 14, NOW()),
(61, 1, 'Plum Purple Embroidered Saree', 'Royal plum purple wedding collection saree with rich border.', 19500.00, 6, 4, 14, NOW()),
(62, 1, 'Navy Blue Embroidered Wedding Saree', 'Midnight blue silk saree adorned with hand embroidery.', 18499.00, 9, 4, 14, NOW()),

(63, 1, 'Antique Gold Zari Work Saree', 'Pure silk saree woven with antique gold zari threads.', 22999.00, 7, 4, 15, NOW()),
(64, 1, 'Red Zari Heavy Brocade Saree', 'Classic wedding scarlet saree with full zari woven brocade.', 24500.00, 5, 4, 15, NOW()),
(65, 1, 'Royal Green Zari Woven Saree', 'Forest green pure silk saree with heavy zari pallu.', 21999.00, 8, 4, 15, NOW()),
(66, 1, 'Copper Zari Metallic Saree', 'Trending copper gold zari weave saree for wedding receptions.', 20999.00, 10, 4, 15, NOW()),
(67, 1, 'Wine Red Zari Border Saree', 'Deep wine shade wedding saree with lustrous golden zari border.', 23800.00, 6, 4, 15, NOW()),

(68, 1, 'Pure Crimson Bridal Silk Saree', 'High grade pure silk bridal saree with traditional motifs.', 27999.00, 5, 4, 16, NOW()),
(69, 1, 'Kanchipuram Pure Bridal Silk', 'Authentic heavyweight Kanchipuram silk saree for Indian brides.', 29500.00, 4, 4, 16, NOW()),
(70, 1, 'Golden Yellow Bridal Silk Saree', 'Auspicious yellow bridal silk saree for Haldi & Muhurtham.', 25999.00, 7, 4, 16, NOW()),
(71, 1, 'Deep Maroon Pure Silk Saree', 'Timeless deep maroon pure silk saree with heavy pallu art.', 28499.00, 6, 4, 16, NOW()),
(72, 1, 'Vermillion Red Bridal Silk Saree', 'Vibrant vermillion red bridal silk saree with pure gold zari.', 31500.00, 3, 4, 16, NOW());

-- 7. Insert Product Images
INSERT INTO productimages (product_id, image_url) VALUES
(1, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Ruffle/Ruffle4.jpeg?updatedAt=1785161024860'),
(2, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Ruffle/Ruffle1.jpeg?updatedAt=1785161024783'),
(3, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Ruffle/Ruffle3.avif?updatedAt=1785161024402'),
(4, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Ruffle/Ruffle2.jpeg?updatedAt=1785161024197'),

(5, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Satin/_Satin2.webp?updatedAt=1785161053940'),
(6, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Satin/_Satin1.jpg?updatedAt=1785161053585'),
(7, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Satin/_Satin3.avif?updatedAt=1785161053131'),
(8, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Satin/_Satin4.jpeg?updatedAt=1785161052740'),

(9, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Net/%20_Net4.jpeg?updatedAt=1785161118413'),
(10, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Net/%20_Net3.jpg?updatedAt=1785161118296'),
(11, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Net/%20_Net2.avif?updatedAt=1785161118255'),
(12, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/Net/%20_Net1.jpeg?updatedAt=1785161118033'),

(13, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Sequin/Sequin3.webp?updatedAt=1785161185269'),
(14, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Sequin/Sequin4.jpeg?updatedAt=1785161185223'),
(15, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Sequin/Sequin2.jpeg?updatedAt=1785161185180'),
(16, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Party%20Wear%20Sarees/_Sequin/Sequin1.jpeg?updatedAt=1785161184855'),

(17, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Georgette/Georgette1.jpg?updatedAt=1785161223667'),
(18, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Georgette/Georgette2.jpeg?updatedAt=1785161223274'),
(19, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Georgette/Georgette3.jpeg?updatedAt=1785161223173'),
(20, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Georgette/Georgette4.jpeg?updatedAt=1785161223010'),

(21, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Linen/%20_Linen1.jpeg?updatedAt=1785161252627'),
(22, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Linen/%20_Linen2.jpeg?updatedAt=1785161252622'),
(23, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Linen/%20_Linen3.webp?updatedAt=1785161252399'),
(24, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Linen/%20_Linen4.jpeg?updatedAt=1785161251950'),

(25, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Printed/_%20%20_Printed3.jpg?updatedAt=1785161278360'),
(26, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Printed/_%20%20_Printed1.jpeg?updatedAt=1785161277532'),
(27, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Printed/_%20%20_Printed4.jpeg?updatedAt=1785161277539'),
(28, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Printed/_%20%20_Printed2.jpeg?updatedAt=1785161277519'),

(29, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Cotton/_Cotton3.jpeg?updatedAt=1785161301936'),
(30, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Cotton/_Cotton4.jpeg?updatedAt=1785161301844'),
(31, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Cotton/_Cotton2.webp?updatedAt=1785161301950'),
(32, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Casual%20Sarees/Cotton/Cotton1%20.jpg?updatedAt=1785161301813'),

(33, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c1.avif?updatedAt=1785214661226'),
(34, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c3.jpg?updatedAt=1785214660756'),
(35, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c2.webp?updatedAt=1785214660838'),
(36, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c4.webp?updatedAt=1785214660851'),
(37, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Chanderi/c5.webp?updatedAt=1785214660798'),

(38, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p1.webp?updatedAt=1785214696341'),
(39, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p2.avif?updatedAt=1785214695924'),
(40, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p5.webp?updatedAt=1785214695213'),
(41, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p3.avif?updatedAt=1785214695059'),
(42, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Paithani/p4.jpeg?updatedAt=1785214694728'),

(43, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b3.webp?updatedAt=1785214721013'),
(44, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b5.avif?updatedAt=1785214720129'),
(45, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b4.webp?updatedAt=1785214720089'),
(46, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b1.webp?updatedAt=1785214719926'),
(47, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Banarasi/b2.webp?updatedAt=1785214719886'),

(48, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k3.jpg?updatedAt=1785214746050'),
(49, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k1.webp?updatedAt=1785214745823'),
(50, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k2.jpg?updatedAt=1785214745416'),
(51, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k4.webp?updatedAt=1785214745086'),
(52, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Traditional%20sarees/Kanjivaram/k5.webp?updatedAt=1785214744446'),

(53, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_5.jpg?updatedAt=1785215669360'),
(54, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_4.webp?updatedAt=1785168206270'),
(55, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_1.webp?updatedAt=1785168201696'),
(56, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_3.webp?updatedAt=1785168203059'),
(57, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Designer%20Bridal/Designer%20Bridal_2.webp?updatedAt=1785168202558'),

(58, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_5.jpeg?updatedAt=1785215700076'),
(59, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_1.jpg?updatedAt=1785168916015'),
(60, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_3.jpeg?updatedAt=1785168251220'),
(61, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_4.webp?updatedAt=1785168255316'),
(62, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Embroidered/Embroidered_2.jpeg?updatedAt=1785168251329'),

(63, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_5.webp'),
(64, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_3.jpg?updatedAt=1785168310198'),
(65, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_4.webp?updatedAt=1785168310150'),
(66, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_1.jpg?updatedAt=1785168309552'),
(67, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Zari%20Work/Zari%20work_2.webp?updatedAt=1785168309711'),

(68, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bridal%20silk_5.webp?updatedAt=1785215761786'),
(69, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bride%20Silk_3.jpg?updatedAt=1785168354745'),
(70, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bride%20Silk_2.jpg?updatedAt=1785168355144'),
(71, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bride%20Silk_4.jpg?updatedAt=1785168353110'),
(72, 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/Wedding%20sarees/Bridal%20Silk/Bride%20Silk_1.jpg?updatedAt=1785168353875');

SET FOREIGN_KEY_CHECKS = 1;
