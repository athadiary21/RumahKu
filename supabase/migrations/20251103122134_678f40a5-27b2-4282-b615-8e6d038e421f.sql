-- Create Admin Panel tables for website content management
CREATE TABLE public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.testimonials_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.faqs_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pricing_tiers_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers_admin ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, admin write
CREATE POLICY "Anyone can view published website content"
  ON public.website_content FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert website content"
  ON public.website_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update website content"
  ON public.website_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete website content"
  ON public.website_content FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Testimonials policies
CREATE POLICY "Anyone can view published testimonials"
  ON public.testimonials_admin FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials_admin FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- FAQs policies
CREATE POLICY "Anyone can view published FAQs"
  ON public.faqs_admin FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage FAQs"
  ON public.faqs_admin FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Pricing tiers policies
CREATE POLICY "Anyone can view published pricing tiers"
  ON public.pricing_tiers_admin FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers_admin FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.website_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.testimonials_admin
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.faqs_admin
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pricing_tiers_admin
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default website content
INSERT INTO public.website_content (key, title, content) VALUES
('hero_title', 'Hero Title', 'Sistem Operasi Keluarga Indonesia'),
('hero_subtitle', 'Hero Subtitle', 'Kelola uang, jadwal, belanja, dan dokumen keluarga di satu tempat'),
('about_text', 'About Text', 'RumahKu adalah platform yang membantu keluarga Indonesia mengelola kehidupan sehari-hari dengan lebih terorganisir');