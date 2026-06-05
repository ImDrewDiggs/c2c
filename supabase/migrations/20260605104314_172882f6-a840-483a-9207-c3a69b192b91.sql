-- =====================================================
-- Phase 1: Multi-tenant foundation
-- organizations -> organization_members -> properties
-- Additive only. Does not touch existing houses/subscriptions.
-- =====================================================

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE public.organization_type AS ENUM (
    'individual', 'hoa', 'airbnb', 'property_management', 'commercial'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.org_member_role AS ENUM ('owner', 'manager', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.property_type AS ENUM (
    'single_family', 'multi_family', 'short_term_rental', 'commercial', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 1) organizations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.organization_type NOT NULL DEFAULT 'individual',
  owner_id uuid NOT NULL,
  billing_email text,
  contact_phone text,
  billing_address jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2) organization_members
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.org_member_role NOT NULL DEFAULT 'member',
  invited_by uuid,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Security-definer helpers to avoid recursive RLS between orgs/members
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_manager(_org_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = _user_id
      AND role IN ('owner','manager')
  );
$$;

-- =====================================================
-- 3) properties (additive; coexists with houses)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_user_id uuid,
  house_id uuid, -- optional link to legacy houses row
  nickname text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  property_type public.property_type NOT NULL DEFAULT 'single_family',
  trash_day text,
  recycle_day text,
  can_count integer NOT NULL DEFAULT 1,
  recycling_enabled boolean NOT NULL DEFAULT false,
  access_notes text,
  gate_code text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT properties_has_owner CHECK (
    organization_id IS NOT NULL OR owner_user_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_properties_org      ON public.properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner    ON public.properties(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_properties_zip      ON public.properties(zip);
CREATE INDEX IF NOT EXISTS idx_properties_status   ON public.properties(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- organizations
CREATE POLICY "Admins manage all organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (is_admin_by_email()) WITH CHECK (is_admin_by_email());

CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_org_member(id, auth.uid()));

CREATE POLICY "Users can create organizations they own"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and managers can update organizations"
  ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_org_manager(id, auth.uid()))
  WITH CHECK (public.is_org_manager(id, auth.uid()));

CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- organization_members
CREATE POLICY "Admins manage all org members"
  ON public.organization_members FOR ALL TO authenticated
  USING (is_admin_by_email()) WITH CHECK (is_admin_by_email());

CREATE POLICY "Users can view their own memberships"
  ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_manager(organization_id, auth.uid()));

CREATE POLICY "Org managers can add members"
  ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

CREATE POLICY "Org managers can update members"
  ON public.organization_members FOR UPDATE TO authenticated
  USING (public.is_org_manager(organization_id, auth.uid()))
  WITH CHECK (public.is_org_manager(organization_id, auth.uid()));

CREATE POLICY "Org managers or self can remove membership"
  ON public.organization_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_org_manager(organization_id, auth.uid()));

-- properties
CREATE POLICY "Admins manage all properties"
  ON public.properties FOR ALL TO authenticated
  USING (is_admin_by_email()) WITH CHECK (is_admin_by_email());

CREATE POLICY "Owners and org members can view properties"
  ON public.properties FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
  );

CREATE POLICY "Users can insert properties they own"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (
    (owner_user_id = auth.uid() AND organization_id IS NULL)
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id, auth.uid()))
  );

CREATE POLICY "Owners and org managers can update properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id, auth.uid()))
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id, auth.uid()))
  );

CREATE POLICY "Owners and org managers can delete properties"
  ON public.properties FOR DELETE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id, auth.uid()))
  );

-- =====================================================
-- Timestamp triggers
-- =====================================================
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Auto-add owner as 'owner' member when an org is created
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_org_owner_as_member()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_organizations_add_owner
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.add_org_owner_as_member();
