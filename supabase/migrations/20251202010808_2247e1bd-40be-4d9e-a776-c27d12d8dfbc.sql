-- ============================================
-- SECURITY FIXES: RLS Policies Update
-- ============================================

-- 1. Fix user_roles: Remove overly permissive "Enable read access for all users" policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;

-- 2. Fix website_content: Restrict unpublished content to admins only
DROP POLICY IF EXISTS "Anyone can view published website content" ON public.website_content;
CREATE POLICY "Anyone can view published content, admins can view all" 
ON public.website_content 
FOR SELECT 
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix testimonials_admin: Restrict unpublished content to admins only
DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials_admin;
CREATE POLICY "Anyone can view published testimonials, admins can view all" 
ON public.testimonials_admin 
FOR SELECT 
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix faqs_admin: Restrict unpublished content to admins only
DROP POLICY IF EXISTS "Anyone can view published FAQs" ON public.faqs_admin;
CREATE POLICY "Anyone can view published FAQs, admins can view all" 
ON public.faqs_admin 
FOR SELECT 
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix pricing_tiers_admin: Restrict unpublished content to admins only
DROP POLICY IF EXISTS "Anyone can view published pricing tiers" ON public.pricing_tiers_admin;
CREATE POLICY "Anyone can view published pricing, admins can view all" 
ON public.pricing_tiers_admin 
FOR SELECT 
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- 6. Add UPDATE policy for documents table
CREATE POLICY "Document owner or family admin can update documents" 
ON public.documents 
FOR UPDATE 
USING (
  (user_id = auth.uid()) OR 
  (get_family_role(auth.uid(), family_id) = 'admin'::app_role)
);

-- 7. Add admin-only SELECT policy for user_roles (admins can see all roles for management)
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));