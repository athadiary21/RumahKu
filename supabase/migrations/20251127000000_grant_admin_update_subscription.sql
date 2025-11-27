-- Grant execute permission for admin_update_subscription to authenticated role
-- This migration ensures client-authenticated admin users can call the RPC
GRANT EXECUTE ON FUNCTION public.admin_update_subscription(uuid, text, text, timestamptz) TO authenticated;
