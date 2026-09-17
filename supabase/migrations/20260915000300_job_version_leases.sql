-- Workers can request a specific analysis version; exhausted leases must not stay processing forever.
drop function public.claim_analysis_job(text,integer);
create function public.claim_analysis_job(p_job_type text,p_lease_seconds integer default 300,p_analysis_version text default null)
returns setof public.analysis_jobs language plpgsql security definer set search_path='' as $$
begin
  if p_lease_seconds is null or p_lease_seconds not between 30 and 3600 then raise exception 'Invalid lease'; end if;
  update public.analysis_jobs set status='failed',last_error='Lease expired; attempt limit reached',completed_at=now(),lease_expires_at=null
    where job_type=p_job_type and status='processing' and lease_expires_at < now() and attempt_count >= max_attempts
      and (p_analysis_version is null or analysis_version=p_analysis_version);
  return query with candidate as (
    select id from public.analysis_jobs where job_type=p_job_type and attempt_count < max_attempts
      and (p_analysis_version is null or analysis_version=p_analysis_version)
      and (status='pending' or (status='processing' and lease_expires_at < now()))
    order by created_at for update skip locked limit 1
  ) update public.analysis_jobs j set status='processing',attempt_count=j.attempt_count+1,
      lease_token=gen_random_uuid(),lease_expires_at=now()+make_interval(secs=>p_lease_seconds),started_at=now(),completed_at=null
    from candidate c where j.id=c.id returning j.*;
end $$;
revoke execute on function public.claim_analysis_job(text,integer,text) from public,anon,authenticated;
grant execute on function public.claim_analysis_job(text,integer,text) to service_role;
