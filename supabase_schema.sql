create table if not exists public.applications (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text,
  project_name text,
  applicant text,
  kol text,
  region text,
  district text,
  meeting_date date,
  hospital text,
  requested_amount numeric,
  meeting_level text,
  academic_rights text,
  expert_level text,
  product_type text,
  hospital_value text,
  monthly_sales numeric,
  sales_trend text,
  growth_opportunity text,
  communication_value text,
  execution_quality text,
  meeting_content text,
  meeting_level_score numeric,
  academic_rights_score numeric,
  expert_level_score numeric,
  product_type_score numeric,
  hospital_value_score numeric,
  monthly_sales_score numeric,
  sales_trend_score numeric,
  growth_opportunity_score numeric,
  communication_value_score numeric,
  execution_quality_score numeric,
  medical_score numeric,
  strategy_score numeric,
  business_score numeric,
  communication_score numeric,
  execution_score numeric,
  total_score numeric,
  support_level text,
  support_range text,
  support_amount numeric,
  budget_note text,
  evaluation text,
  raw_payload jsonb
);

alter table public.applications enable row level security;

create policy "authenticated users can read applications"
on public.applications for select
to authenticated
using (true);

create policy "authenticated users can insert applications"
on public.applications for insert
to authenticated
with check (true);

create policy "authenticated users can update applications"
on public.applications for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete applications"
on public.applications for delete
to authenticated
using (true);
