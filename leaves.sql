create table public.leaves (
  id bigint generated always as identity not null,
  employee_id bigint not null,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  days integer not null,
  reason text null,
  status text not null default 'pending'::text,
  hr_comment text null,
  created_at timestamp with time zone null default now(),
  constraint leaves_pkey primary key (id),
  constraint leaves_employee_id_fkey foreign KEY (employee_id) references employees (id) on delete CASCADE
) TABLESPACE pg_default;
