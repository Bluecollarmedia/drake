-- If an Edge Function disappears after a paid model call, the exact cost cannot be reported.
-- Conservatively commit the pre-call reservation when its lease expires. The user's event
-- remains failed and therefore does not consume a recommendation allowance.
create or replace function public.commit_expired_recommendation_budget()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.status='reserved' and new.status='failed'
    and new.metadata->>'failure'='reservation_expired' and old.reserved_cost_usd>0 then
    if old.budget_day_start is not null then
      update public.operator_budget_periods set committed_cost_usd=committed_cost_usd+old.reserved_cost_usd,updated_at=now()
        where period_kind='day' and period_start=old.budget_day_start;
    end if;
    if old.budget_month_start is not null then
      update public.operator_budget_periods set committed_cost_usd=committed_cost_usd+old.reserved_cost_usd,updated_at=now()
        where period_kind='month' and period_start=old.budget_month_start;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists usage_events_commit_expired_budget on public.usage_events;
create trigger usage_events_commit_expired_budget before update of status,metadata on public.usage_events
for each row execute function public.commit_expired_recommendation_budget();

revoke all on function public.commit_expired_recommendation_budget() from public,anon,authenticated,service_role;
comment on function public.commit_expired_recommendation_budget() is 'Trigger-only fail-safe: expired pre-call reservations become conservative committed operator spend.';
