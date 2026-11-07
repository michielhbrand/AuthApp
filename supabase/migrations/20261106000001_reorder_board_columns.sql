create or replace function public.reorder_board_columns(
  p_board_id uuid,
  p_column_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
  v_input_count integer;
  v_distinct_count integer;
  v_offset integer;
begin
  select count(*)
  into v_count
  from public.board_columns
  where board_id = p_board_id;

  v_input_count := coalesce(array_length(p_column_ids, 1), 0);

  select count(distinct value)
  into v_distinct_count
  from unnest(p_column_ids) as columns(value);

  if v_count = 0 or v_input_count <> v_count or v_distinct_count <> v_count then
    raise exception 'Column list does not match board';
  end if;

  if exists (
    select 1
    from unnest(p_column_ids) as columns(value)
    where not exists (
      select 1
      from public.board_columns
      where board_id = p_board_id and id = columns.value
    )
  ) then
    raise exception 'Column list does not match board';
  end if;

  select coalesce(max(position), -1) + 1
  into v_offset
  from public.board_columns
  where board_id = p_board_id;

  update public.board_columns as column_row
  set position = v_offset + (ordering.ordinality)::integer
  from unnest(p_column_ids) with ordinality as ordering(id, ordinality)
  where column_row.id = ordering.id and column_row.board_id = p_board_id;

  update public.board_columns as column_row
  set position = (ordering.ordinality)::integer - 1
  from unnest(p_column_ids) with ordinality as ordering(id, ordinality)
  where column_row.id = ordering.id and column_row.board_id = p_board_id;
end;
$$;

revoke execute on function public.reorder_board_columns(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_board_columns(uuid, uuid[]) to authenticated;
