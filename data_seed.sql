-- Data Seed Script for Sarees For Naaris Catalog

USE my_ecommerce;

-- Clean existing catalog data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE productimages;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE products;
TRUNCATE TABLE sub_category;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Categories
INSERT INTO categories (category_id, category_name) VALUES
(1, 'Banarasi'),
(2, 'Kanjivaram'),
(3, 'Chanderi'),
(4, 'Paithani'),
(5, 'Cotton'),
(6, 'Silk'),
(7, 'Party Wear'),
(8, 'Wedding');

-- 2. Insert Subcategories
INSERT INTO sub_category (subcategory_id, category_id, subcategory_name) VALUES
(1, 1, 'Zari Woven Banarasi Silk'),
(2, 1, 'Katan Silk Banarasi'),
(3, 2, 'Traditional Temple Kanjivaram'),
(4, 2, 'Bridal Pure Gold Zari Kanjivaram'),
(5, 3, 'Handloom Tissue Chanderi'),
(6, 3, 'Silk Cotton Chanderi'),
(7, 4, 'Royal Peacock Border Paithani'),
(8, 4, 'Traditional Maharani Paithani'),
(9, 5, 'Mulmul Printed Cotton'),
(10, 6, 'Tussar Pure Silk'),
(11, 7, 'Designer Sequined Party Saree'),
(12, 8, 'Heavy Brocade Wedding Collection');

-- 3. Insert Products
INSERT INTO products (product_id, name, description, price, stock, category_id, subcategory_id, created_at) VALUES
(1, 'Royal Red Banarasi Zari Silk Saree', 'Exquisite handwoven crimson Banarasi silk saree featuring heavy golden floral jaal and rich pallu.', 12999.00, 15, 1, 1, NOW() - INTERVAL 1 DAY),
(2, 'Gold Tissue Banarasi Brocade Saree', 'Stunning golden tissue Banarasi saree with intricated silver-gold zari weave for festive luxury.', 14499.00, 10, 1, 2, NOW() - INTERVAL 2 DAY),
(3, 'Emerald Green Banarasi Silk Saree', 'Deep emerald green Katan silk saree with timeless kadwa weave motifs.', 11800.00, 20, 1, 2, NOW() - INTERVAL 3 DAY),
(4, 'Pink Floral Jamdani Banarasi Saree', 'Delicate pastel pink Banarasi saree crafted with intricate floral jamdani weave.', 9899.00, 12, 1, 1, NOW() - INTERVAL 4 DAY),
(5, 'Maroon Royal Brocade Banarasi Saree', 'Traditional bridal maroon saree embellished with dense gold zari weave.', 15999.00, 8, 1, 1, NOW() - INTERVAL 5 DAY),

(6, 'Classic Mustard Gold Kanjivaram', 'Authentic Kanjivaram silk saree in vibrant mustard gold with rich contrasting border.', 18999.00, 14, 2, 3, NOW() - INTERVAL 1 DAY),
(7, 'Magenta Bridal Silk Kanjivaram', 'Pure zari woven magenta bridal saree featuring temple motifs and pure silk lustre.', 22500.00, 6, 2, 4, NOW() - INTERVAL 2 DAY),
(8, 'Royal Blue Korvai Kanjivaram', 'Classic royal blue Kanjivaram silk saree with traditional contrast korvai border.', 16499.00, 18, 2, 3, NOW() - INTERVAL 3 DAY),
(9, 'Deep Crimson Temple Border Silk', 'Rich crimson red Kanjivaram saree with elegant zari temple design on pallu.', 19800.00, 9, 2, 4, NOW() - INTERVAL 4 DAY),
(10, 'Pastel Peach Zari Kanjivaram', 'Modern pastel peach silk Kanjivaram with subtle silver zari weaves.', 14999.00, 11, 2, 3, NOW() - INTERVAL 5 DAY),

(11, 'Pastel Pink Handloom Chanderi Saree', 'Lightweight pastel pink Chanderi saree with sheer texture and gold zari bootis.', 4999.00, 25, 3, 5, NOW() - INTERVAL 1 DAY),
(12, 'Mint Green Chanderi Silk Saree', 'Refreshing mint green Chanderi silk saree with hand-printed floral motifs.', 5499.00, 22, 3, 6, NOW() - INTERVAL 2 DAY),
(13, 'Golden Yellow Tissue Chanderi Saree', 'Graceful golden Chanderi tissue saree perfect for daytime rituals andhaldi ceremonies.', 6299.00, 15, 3, 5, NOW() - INTERVAL 3 DAY),
(14, 'Off-White Chanderi Cotton Saree', 'Elegant ivory off-white Chanderi saree with red contrast border.', 4299.00, 30, 3, 6, NOW() - INTERVAL 4 DAY),
(15, 'Lavender Silver Zari Chanderi Saree', 'Contemporary lavender shade Chanderi saree woven with delicate silver threads.', 5899.00, 17, 3, 5, NOW() - INTERVAL 5 DAY),

(16, 'Peacock Blue Royal Paithani Saree', 'Traditional hand-loomed peacock blue Paithani saree with pure zari peacock motif border.', 24999.00, 5, 4, 7, NOW() - INTERVAL 1 DAY),
(17, 'Bright Yellow Maharani Paithani', 'Iconic yellow Paithani saree featuring rich multicolored pallu with lotus motifs.', 21999.00, 7, 4, 8, NOW() - INTERVAL 2 DAY),
(18, 'Magenta Silk Paithani Saree', 'Royal magenta Paithani saree with traditional gold zari border.', 19999.00, 10, 4, 7, NOW() - INTERVAL 3 DAY),
(19, 'Dark Green Floral Border Paithani', 'Rich forest green silk Paithani adorned with peacock pallu art.', 23500.00, 6, 4, 8, NOW() - INTERVAL 4 DAY),
(20, 'Crimson Red Festive Paithani', 'Vibrant red Paithani saree for weddings and grand festive celebrations.', 25999.00, 4, 4, 7, NOW() - INTERVAL 5 DAY);

-- 4. Insert Product Images
INSERT INTO productimages (product_id, image_url) VALUES
(1, '/categories/banarasi/b1.webp'),
(2, '/categories/banarasi/b2.webp'),
(3, '/categories/banarasi/b3.webp'),
(4, '/categories/banarasi/b4.webp'),
(5, '/categories/banarasi/b5.avif'),

(6, '/categories/kanjivaram/k1.webp'),
(7, '/categories/kanjivaram/k2.jpg'),
(8, '/categories/kanjivaram/k3.jpg'),
(9, '/categories/kanjivaram/k4.webp'),
(10, '/categories/kanjivaram/k5.webp'),

(11, '/categories/chendari/c1.avif'),
(12, '/categories/chendari/c2.webp'),
(13, '/categories/chendari/c3.jpg'),
(14, '/categories/chendari/c4.webp'),
(15, '/categories/chendari/c5.webp'),

(16, '/categories/paithani/p1.webp'),
(17, '/categories/paithani/p2.avif'),
(18, '/categories/paithani/p3.avif'),
(19, '/categories/paithani/p4.jpeg'),
(20, '/categories/paithani/p5.webp');
