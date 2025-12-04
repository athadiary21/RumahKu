-- Create family invitations table
CREATE TABLE public.family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE NOT NULL,
  invited_by uuid NOT NULL,
  email text,
  role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text DEFAULT 'pending' NOT NULL,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days') NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  used_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Family members can view invitations for their family
CREATE POLICY "Family members can view invitations"
ON public.family_invitations
FOR SELECT
USING (is_family_member(auth.uid(), family_id));

-- Family admins can create invitations
CREATE POLICY "Family admins can create invitations"
ON public.family_invitations
FOR INSERT
WITH CHECK (get_family_role(auth.uid(), family_id) = 'admin'::app_role);

-- Family admins can update invitations (cancel)
CREATE POLICY "Family admins can update invitations"
ON public.family_invitations
FOR UPDATE
USING (get_family_role(auth.uid(), family_id) = 'admin'::app_role);

-- Family admins can delete invitations
CREATE POLICY "Family admins can delete invitations"
ON public.family_invitations
FOR DELETE
USING (get_family_role(auth.uid(), family_id) = 'admin'::app_role);

-- Anyone can view invitation by token (for joining)
CREATE POLICY "Anyone can view invitation by token"
ON public.family_invitations
FOR SELECT
USING (status = 'pending' AND expires_at > now());

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_family_invitation(invitation_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  existing_membership RECORD;
  result json;
BEGIN
  -- Get invitation
  SELECT * INTO inv
  FROM public.family_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Undangan tidak valid atau sudah kedaluwarsa');
  END IF;

  -- Check if user is already a member
  SELECT * INTO existing_membership
  FROM public.family_members
  WHERE user_id = auth.uid() AND family_id = inv.family_id;

  IF FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Anda sudah menjadi anggota keluarga ini');
  END IF;

  -- Add user to family
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (inv.family_id, auth.uid(), inv.role);

  -- Update invitation status
  UPDATE public.family_invitations
  SET status = 'accepted', used_at = now()
  WHERE id = inv.id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Berhasil bergabung dengan keluarga',
    'family_id', inv.family_id
  );
END;
$$;