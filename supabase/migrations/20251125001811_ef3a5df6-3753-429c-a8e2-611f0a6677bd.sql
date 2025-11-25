-- Create activity_logs table for tracking user actions
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create traffic_logs table for tracking page views
CREATE TABLE IF NOT EXISTS public.traffic_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page TEXT NOT NULL,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON public.activity_logs(timestamp);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);

CREATE INDEX idx_traffic_logs_user_id ON public.traffic_logs(user_id);
CREATE INDEX idx_traffic_logs_timestamp ON public.traffic_logs(timestamp);
CREATE INDEX idx_traffic_logs_page ON public.traffic_logs(page);
CREATE INDEX idx_traffic_logs_session_id ON public.traffic_logs(session_id);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for traffic_logs
CREATE POLICY "Users can view their own traffic logs"
  ON public.traffic_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert traffic logs"
  ON public.traffic_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all traffic logs"
  ON public.traffic_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));