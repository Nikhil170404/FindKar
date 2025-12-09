-- Menu Items System for Findkar
-- Run this in your Supabase SQL Editor

-- Predefined menu items (200+ street food items)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor's selected menu items
CREATE TABLE IF NOT EXISTS vendor_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  price INTEGER, -- Optional price in paisa (e.g., 2000 = ₹20)
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, menu_item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS idx_vendor_menu_vendor ON vendor_menu(vendor_id);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_menu ENABLE ROW LEVEL SECURITY;

-- Menu items: everyone can read
CREATE POLICY "Anyone can read menu items" ON menu_items FOR SELECT USING (true);

-- Vendor menu: everyone can read, vendors can manage their own
CREATE POLICY "Anyone can read vendor menu" ON vendor_menu FOR SELECT USING (true);
CREATE POLICY "Vendors can insert own menu" ON vendor_menu FOR INSERT WITH CHECK (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);
CREATE POLICY "Vendors can update own menu" ON vendor_menu FOR UPDATE USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);
CREATE POLICY "Vendors can delete own menu" ON vendor_menu FOR DELETE USING (
  vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- ========================================
-- PRE-POPULATED STREET FOOD ITEMS (200+)
-- ========================================

-- Indian Snacks (40 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Vada Pav', '🥔', 'Indian Snacks'),
('Samosa', '🥟', 'Indian Snacks'),
('Pav Bhaji', '🍛', 'Indian Snacks'),
('Aloo Tikki', '🧆', 'Indian Snacks'),
('Kachori', '🥮', 'Indian Snacks'),
('Dabeli', '🥪', 'Indian Snacks'),
('Bhel Puri', '🥗', 'Indian Snacks'),
('Sev Puri', '🫓', 'Indian Snacks'),
('Pani Puri', '💧', 'Indian Snacks'),
('Dahi Puri', '🥛', 'Indian Snacks'),
('Ragda Pattice', '🍲', 'Indian Snacks'),
('Misal Pav', '🌶️', 'Indian Snacks'),
('Poha', '🍚', 'Indian Snacks'),
('Upma', '🫕', 'Indian Snacks'),
('Sabudana Khichdi', '⚪', 'Indian Snacks'),
('Medu Vada', '🍩', 'Indian Snacks'),
('Idli', '⚪', 'Indian Snacks'),
('Dosa', '🫓', 'Indian Snacks'),
('Masala Dosa', '🫓', 'Indian Snacks'),
('Rava Dosa', '🫓', 'Indian Snacks'),
('Uttapam', '🥞', 'Indian Snacks'),
('Chole Bhature', '🫓', 'Indian Snacks'),
('Aloo Paratha', '🫓', 'Indian Snacks'),
('Paneer Paratha', '🧀', 'Indian Snacks'),
('Gobi Paratha', '🥦', 'Indian Snacks'),
('Stuffed Kulcha', '🫓', 'Indian Snacks'),
('Bread Pakora', '🍞', 'Indian Snacks'),
('Onion Pakora', '🧅', 'Indian Snacks'),
('Paneer Pakora', '🧀', 'Indian Snacks'),
('Mix Pakora', '🥘', 'Indian Snacks'),
('Batata Vada', '🥔', 'Indian Snacks'),
('Kanda Bhaji', '🧅', 'Indian Snacks'),
('Mirchi Bhaji', '🌶️', 'Indian Snacks'),
('Sabudana Vada', '⚪', 'Indian Snacks'),
('Aloo Bonda', '🥔', 'Indian Snacks'),
('Mysore Bonda', '🟤', 'Indian Snacks'),
('Punugulu', '🟤', 'Indian Snacks'),
('Pesarattu', '🫓', 'Indian Snacks'),
('Appam', '⚪', 'Indian Snacks'),
('Puttu', '🫕', 'Indian Snacks');

-- Chinese/Indo-Chinese (35 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Veg Noodles', '🍜', 'Chinese'),
('Chicken Noodles', '🍜', 'Chinese'),
('Egg Noodles', '🍜', 'Chinese'),
('Hakka Noodles', '🍜', 'Chinese'),
('Schezwan Noodles', '🌶️', 'Chinese'),
('Veg Fried Rice', '🍚', 'Chinese'),
('Chicken Fried Rice', '🍚', 'Chinese'),
('Egg Fried Rice', '🍚', 'Chinese'),
('Schezwan Rice', '🌶️', 'Chinese'),
('Triple Rice', '🍚', 'Chinese'),
('Veg Manchurian', '🥡', 'Chinese'),
('Chicken Manchurian', '🐔', 'Chinese'),
('Gobi Manchurian', '🥦', 'Chinese'),
('Paneer Manchurian', '🧀', 'Chinese'),
('Veg Momos', '🥟', 'Chinese'),
('Chicken Momos', '🥟', 'Chinese'),
('Paneer Momos', '🥟', 'Chinese'),
('Steam Momos', '🥟', 'Chinese'),
('Fried Momos', '🥟', 'Chinese'),
('Tandoori Momos', '🥟', 'Chinese'),
('Chilli Momos', '🌶️', 'Chinese'),
('Spring Roll', '🌯', 'Chinese'),
('Veg Spring Roll', '🌯', 'Chinese'),
('Chicken Spring Roll', '🌯', 'Chinese'),
('Manchow Soup', '🍲', 'Chinese'),
('Hot & Sour Soup', '🍲', 'Chinese'),
('Sweet Corn Soup', '🌽', 'Chinese'),
('Chilli Paneer', '🧀', 'Chinese'),
('Chilli Chicken', '🌶️', 'Chinese'),
('Honey Chilli Potato', '🍯', 'Chinese'),
('Dragon Chicken', '🐉', 'Chinese'),
('Crispy Corn', '🌽', 'Chinese'),
('American Chopsuey', '🍝', 'Chinese'),
('Chowmein', '🍜', 'Chinese'),
('Dry Manchurian', '🥡', 'Chinese');

-- Beverages (30 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Chai', '☕', 'Beverages'),
('Masala Chai', '🫖', 'Beverages'),
('Ginger Tea', '🫚', 'Beverages'),
('Cutting Chai', '☕', 'Beverages'),
('Special Chai', '⭐', 'Beverages'),
('Elaichi Chai', '🫖', 'Beverages'),
('Coffee', '☕', 'Beverages'),
('Filter Coffee', '☕', 'Beverages'),
('Cold Coffee', '🧊', 'Beverages'),
('Cappuccino', '☕', 'Beverages'),
('Lassi', '🥛', 'Beverages'),
('Sweet Lassi', '🥛', 'Beverages'),
('Mango Lassi', '🥭', 'Beverages'),
('Buttermilk', '🥛', 'Beverages'),
('Chaas', '🥛', 'Beverages'),
('Nimbu Pani', '🍋', 'Beverages'),
('Sugarcane Juice', '🎋', 'Beverages'),
('Coconut Water', '🥥', 'Beverages'),
('Fresh Juice', '🧃', 'Beverages'),
('Orange Juice', '🍊', 'Beverages'),
('Watermelon Juice', '🍉', 'Beverages'),
('Mixed Fruit Juice', '🍹', 'Beverages'),
('Mango Shake', '🥭', 'Beverages'),
('Banana Shake', '🍌', 'Beverages'),
('Strawberry Shake', '🍓', 'Beverages'),
('Oreo Shake', '🍪', 'Beverages'),
('Rose Sharbat', '🌹', 'Beverages'),
('Thandai', '🥛', 'Beverages'),
('Aam Panna', '🥭', 'Beverages'),
('Jaljeera', '🧂', 'Beverages');

-- Fast Food (35 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Veg Burger', '🍔', 'Fast Food'),
('Chicken Burger', '🍔', 'Fast Food'),
('Paneer Burger', '🍔', 'Fast Food'),
('Aloo Tikki Burger', '🍔', 'Fast Food'),
('Double Cheese Burger', '🧀', 'Fast Food'),
('Veg Pizza', '🍕', 'Fast Food'),
('Cheese Pizza', '🍕', 'Fast Food'),
('Paneer Pizza', '🍕', 'Fast Food'),
('Veg Sandwich', '🥪', 'Fast Food'),
('Cheese Sandwich', '🥪', 'Fast Food'),
('Grilled Sandwich', '🥪', 'Fast Food'),
('Club Sandwich', '🥪', 'Fast Food'),
('Paneer Sandwich', '🥪', 'Fast Food'),
('Hot Dog', '🌭', 'Fast Food'),
('Veg Hot Dog', '🌭', 'Fast Food'),
('French Fries', '🍟', 'Fast Food'),
('Peri Peri Fries', '🌶️', 'Fast Food'),
('Loaded Fries', '🍟', 'Fast Food'),
('Cheese Fries', '🧀', 'Fast Food'),
('Pasta', '🍝', 'Fast Food'),
('White Sauce Pasta', '🍝', 'Fast Food'),
('Red Sauce Pasta', '🍅', 'Fast Food'),
('Garlic Bread', '🥖', 'Fast Food'),
('Cheesy Garlic Bread', '🧀', 'Fast Food'),
('Nachos', '🌮', 'Fast Food'),
('Tacos', '🌮', 'Fast Food'),
('Quesadilla', '🫓', 'Fast Food'),
('Wraps', '🌯', 'Fast Food'),
('Chicken Wrap', '🌯', 'Fast Food'),
('Paneer Wrap', '🌯', 'Fast Food'),
('Veg Wrap', '🌯', 'Fast Food'),
('Frankie', '🌯', 'Fast Food'),
('Egg Frankie', '🌯', 'Fast Food'),
('Chicken Frankie', '🌯', 'Fast Food'),
('Paneer Frankie', '🌯', 'Fast Food');

-- Rolls & Wraps (20 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Kathi Roll', '🌯', 'Rolls'),
('Egg Roll', '🥚', 'Rolls'),
('Chicken Roll', '🐔', 'Rolls'),
('Mutton Roll', '🐑', 'Rolls'),
('Paneer Roll', '🧀', 'Rolls'),
('Veg Roll', '🥬', 'Rolls'),
('Double Egg Roll', '🥚', 'Rolls'),
('Egg Chicken Roll', '🥚', 'Rolls'),
('Rumali Roll', '🫓', 'Rolls'),
('Tandoori Roll', '🔥', 'Rolls'),
('Seekh Kebab Roll', '🍢', 'Rolls'),
('Tikka Roll', '🍖', 'Rolls'),
('Shawarma', '🌯', 'Rolls'),
('Chicken Shawarma', '🌯', 'Rolls'),
('Falafel Wrap', '🧆', 'Rolls'),
('Fish Roll', '🐟', 'Rolls'),
('Cheese Roll', '🧀', 'Rolls'),
('Spring Roll Wrap', '🌯', 'Rolls'),
('Mexican Roll', '🌮', 'Rolls'),
('Lebanese Roll', '🌯', 'Rolls');

-- Sweets & Desserts (25 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Jalebi', '🍩', 'Sweets'),
('Gulab Jamun', '🟤', 'Sweets'),
('Rasgulla', '⚪', 'Sweets'),
('Kulfi', '🍦', 'Sweets'),
('Rabri', '🍮', 'Sweets'),
('Falooda', '🍨', 'Sweets'),
('Gajar Halwa', '🥕', 'Sweets'),
('Moong Dal Halwa', '🟡', 'Sweets'),
('Malpua', '🥞', 'Sweets'),
('Imarti', '🍩', 'Sweets'),
('Gujiya', '🥟', 'Sweets'),
('Rasmalai', '🥛', 'Sweets'),
('Sandesh', '⬜', 'Sweets'),
('Malai Kulfi', '🍦', 'Sweets'),
('Mango Kulfi', '🥭', 'Sweets'),
('Pista Kulfi', '🟢', 'Sweets'),
('Ice Cream', '🍦', 'Sweets'),
('Sundae', '🍨', 'Sweets'),
('Brownie', '🟫', 'Sweets'),
('Chocolate Cake', '🍫', 'Sweets'),
('Kheer', '🍚', 'Sweets'),
('Shrikhand', '🥛', 'Sweets'),
('Basundi', '🥛', 'Sweets'),
('Phirni', '🍮', 'Sweets'),
('Ladoo', '🟡', 'Sweets');

-- Non-Veg Street Food (25 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Chicken Tikka', '🍗', 'Non-Veg'),
('Seekh Kebab', '🍢', 'Non-Veg'),
('Tandoori Chicken', '🐔', 'Non-Veg'),
('Chicken Biryani', '🍛', 'Non-Veg'),
('Mutton Biryani', '🍛', 'Non-Veg'),
('Egg Biryani', '🥚', 'Non-Veg'),
('Chicken Curry', '🍛', 'Non-Veg'),
('Butter Chicken', '🧈', 'Non-Veg'),
('Egg Curry', '🥚', 'Non-Veg'),
('Fish Fry', '🐟', 'Non-Veg'),
('Fish Curry', '🐟', 'Non-Veg'),
('Prawn Fry', '🦐', 'Non-Veg'),
('Chicken Lollipop', '🍡', 'Non-Veg'),
('Chicken 65', '🔥', 'Non-Veg'),
('Chicken Leg Piece', '🍗', 'Non-Veg'),
('Keema Pav', '🍖', 'Non-Veg'),
('Bheja Fry', '🧠', 'Non-Veg'),
('Boti Kebab', '🍖', 'Non-Veg'),
('Reshmi Kebab', '🍢', 'Non-Veg'),
('Tangdi Kebab', '🍗', 'Non-Veg'),
('Egg Bhurji', '🥚', 'Non-Veg'),
('Omelette', '🍳', 'Non-Veg'),
('Boiled Eggs', '🥚', 'Non-Veg'),
('Half Fry', '🍳', 'Non-Veg'),
('Full Fry', '🍳', 'Non-Veg');

-- Chaat Items (15 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Papdi Chaat', '🫓', 'Chaat'),
('Aloo Chaat', '🥔', 'Chaat'),
('Fruit Chaat', '🍇', 'Chaat'),
('Tikki Chaat', '🧆', 'Chaat'),
('Samosa Chaat', '🥟', 'Chaat'),
('Kachori Chaat', '🥮', 'Chaat'),
('Chole Chaat', '🫘', 'Chaat'),
('Ram Ladoo', '🟡', 'Chaat'),
('Gol Gappe', '💧', 'Chaat'),
('Dahi Bhalla', '🥛', 'Chaat'),
('Basket Chaat', '🧺', 'Chaat'),
('Kulle Chaat', '🥒', 'Chaat'),
('Corn Chaat', '🌽', 'Chaat'),
('Sprout Chaat', '🌱', 'Chaat'),
('Mixed Chaat', '🥗', 'Chaat');

-- Breakfast Items (15 items)
INSERT INTO menu_items (name, emoji, category) VALUES
('Bread Butter', '🍞', 'Breakfast'),
('Bread Jam', '🍞', 'Breakfast'),
('Toast', '🍞', 'Breakfast'),
('Butter Toast', '🧈', 'Breakfast'),
('Peanut Butter Toast', '🥜', 'Breakfast'),
('Egg Toast', '🥚', 'Breakfast'),
('Milk', '🥛', 'Breakfast'),
('Badam Milk', '🥜', 'Breakfast'),
('Haldi Milk', '🟡', 'Breakfast'),
('Cornflakes', '🥣', 'Breakfast'),
('Oats', '🥣', 'Breakfast'),
('Paratha', '🫓', 'Breakfast'),
('Thepla', '🫓', 'Breakfast'),
('Dhokla', '🟨', 'Breakfast'),
('Khandvi', '🟢', 'Breakfast');

SELECT 'Menu items inserted successfully! Total: ' || COUNT(*) as result FROM menu_items;
