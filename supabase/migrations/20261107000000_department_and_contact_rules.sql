alter table public.boards drop constraint if exists boards_name_unique;
alter table public.boards drop constraint if exists boards_department_check;

drop index if exists public.boards_name_lower_key;

create unique index boards_department_name_lower_key
  on public.boards (department, lower(name));

drop index if exists public.applicants_board_email_lower_key;
drop index if exists public.applicants_board_phone_key;

create unique index applicants_board_email_lower_key
  on public.applicants (board_id, lower(email))
  where btrim(email) <> '';

create unique index applicants_board_phone_key
  on public.applicants (board_id, phone)
  where btrim(phone) <> '';
