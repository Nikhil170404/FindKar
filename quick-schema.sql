-- Quick Schema for Findkar MVP
-- Run this in Supabase SQL Editor

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  open_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM',
  is_open BOOLEAN DEFAULT false,
  last_opened TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_visits table
CREATE TABLE IF NOT EXISTS public.vendor_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_is_open ON public.vendors(is_open);
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_id ON public.menu_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_visits_vendor_id ON public.vendor_visits(vendor_id);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Anyone can view vendors" ON public.vendors
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own vendor profile" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor profile" ON public.vendors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Vendors can manage their menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = menu_items.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- RLS Policies for vendor_visits
CREATE POLICY "Anyone can create visits" ON public.vendor_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Vendors can view their visits" ON public.vendor_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_visits.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );
