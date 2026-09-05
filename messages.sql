create table public.messages (
  id bigserial not null,
  from_email text not null,
  to_email text not null,
  text text not null,
  timestamp bigint not null default (
    EXTRACT(
      epoch
      from
        now()
    ) * (1000)::numeric
  ),
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id)
) TABLESPACE pg_default;
