grant select, insert, update, delete on table public.boards to authenticated;
grant select, insert, update, delete on table public.board_columns to authenticated;
grant select, insert, update, delete on table public.applicants to authenticated;

revoke all on table public.boards from anon;
revoke all on table public.board_columns from anon;
revoke all on table public.applicants from anon;
