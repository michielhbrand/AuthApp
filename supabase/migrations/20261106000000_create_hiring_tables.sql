create table public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null default 'Engineering',
  open_positions integer not null default 1 check (open_positions >= 0),
  deadline date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_department_check check (
    department in (
      'Engineering',
      'Design',
      'Analytics',
      'Sales',
      'Operations',
      'Customer success',
      'Marketing'
    )
  ),
  constraint boards_name_unique unique (name)
);

create unique index boards_name_lower_key on public.boards (lower(name));

create table public.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_columns_position_unique unique (board_id, position) deferrable initially immediate,
  constraint board_columns_board_id_id_unique unique (board_id, id)
);

create unique index board_columns_board_name_lower_key
  on public.board_columns (board_id, lower(name));

create index board_columns_board_position_idx
  on public.board_columns (board_id, position);

create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  column_id uuid not null,
  full_name text not null,
  email text not null,
  phone text not null,
  job_title text not null default '',
  education text not null default '',
  experience text not null default '',
  favorite boolean not null default false,
  status text not null default 'active',
  applied_at timestamptz not null default now(),
  step_entered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applicants_status_check check (status in ('active', 'hired', 'rejected')),
  constraint applicants_column_fk foreign key (board_id, column_id)
    references public.board_columns (board_id, id) on delete no action
);

create unique index applicants_board_email_lower_key
  on public.applicants (board_id, lower(email));

create unique index applicants_board_phone_key
  on public.applicants (board_id, phone);

create index applicants_board_column_idx
  on public.applicants (board_id, column_id);

create index applicants_column_idx
  on public.applicants (column_id);

create index applicants_board_status_idx
  on public.applicants (board_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger boards_set_updated_at
  before update on public.boards
  for each row execute function public.set_updated_at();

create trigger board_columns_set_updated_at
  before update on public.board_columns
  for each row execute function public.set_updated_at();

create trigger applicants_set_updated_at
  before update on public.applicants
  for each row execute function public.set_updated_at();

create or replace function public.create_board(
  p_name text,
  p_department text,
  p_deadline date,
  p_open_positions integer
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_board_id uuid;
begin
  insert into public.boards (name, department, deadline, open_positions)
  values (p_name, p_department, p_deadline, p_open_positions)
  returning id into v_board_id;

  insert into public.board_columns (board_id, name, position)
  values (v_board_id, 'Applied', 0);

  return v_board_id;
end;
$$;

create or replace function public.add_board_column(
  p_board_id uuid,
  p_name text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_position integer;
  v_column_id uuid;
begin
  select coalesce(max(position) + 1, 0)
  into v_position
  from public.board_columns
  where board_id = p_board_id;

  insert into public.board_columns (board_id, name, position)
  values (p_board_id, p_name, v_position)
  returning id into v_column_id;

  return v_column_id;
end;
$$;

create or replace function public.delete_board_column(
  p_column_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_board_id uuid;
  v_first_column_id uuid;
begin
  select board_id
  into v_board_id
  from public.board_columns
  where id = p_column_id;

  if v_board_id is null then
    raise exception 'Board column not found';
  end if;

  select id
  into v_first_column_id
  from public.board_columns
  where board_id = v_board_id
  order by position asc
  limit 1;

  if v_first_column_id = p_column_id then
    raise exception 'The first board column cannot be deleted';
  end if;

  update public.applicants
  set column_id = v_first_column_id,
      step_entered_at = now()
  where column_id = p_column_id;

  delete from public.board_columns
  where id = p_column_id;
end;
$$;

alter table public.boards enable row level security;
alter table public.board_columns enable row level security;
alter table public.applicants enable row level security;

create policy "Authenticated users can read boards"
  on public.boards for select to authenticated using (true);

create policy "Authenticated users can insert boards"
  on public.boards for insert to authenticated with check (true);

create policy "Authenticated users can update boards"
  on public.boards for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete boards"
  on public.boards for delete to authenticated using (true);

create policy "Authenticated users can read board columns"
  on public.board_columns for select to authenticated using (true);

create policy "Authenticated users can insert board columns"
  on public.board_columns for insert to authenticated with check (true);

create policy "Authenticated users can update board columns"
  on public.board_columns for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete board columns"
  on public.board_columns for delete to authenticated using (true);

create policy "Authenticated users can read applicants"
  on public.applicants for select to authenticated using (true);

create policy "Authenticated users can insert applicants"
  on public.applicants for insert to authenticated with check (true);

create policy "Authenticated users can update applicants"
  on public.applicants for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete applicants"
  on public.applicants for delete to authenticated using (true);

revoke execute on function public.create_board(text, text, date, integer) from public, anon;
revoke execute on function public.add_board_column(uuid, text) from public, anon;
revoke execute on function public.delete_board_column(uuid) from public, anon;

grant execute on function public.create_board(text, text, date, integer) to authenticated;
grant execute on function public.add_board_column(uuid, text) to authenticated;
grant execute on function public.delete_board_column(uuid) to authenticated;
