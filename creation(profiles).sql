create table public.profiles (
  id uuid not null,
  full_name text not null,
  role text not null,
  created_at timestamp with time zone null default now(),
  email text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (
        array['admin'::text, 'hr'::text, 'employee'::text]
      )
    )
  )
) TABLESPACE pg_default;
