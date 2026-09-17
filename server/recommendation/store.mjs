import {candidateForReranking,EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION} from './engine.mjs';

export async function loadRecommendationProfiles(db,profileIds){
 const {rows}=await db.query(`select p.*,s.title,s.version_key,
   coalesce((select jsonb_agg(jsonb_build_object('text',sc.scenario_text,'variation',sc.variation) order by sc.created_at)
     from public.song_scenarios sc where sc.profile_id=p.id and sc.scenario_type='matching_language'),'[]'::jsonb) example_inputs
   from public.song_analysis_profiles p join public.songs s on s.id=p.song_id
   where p.id=any($1::uuid[])`,[profileIds]);
 return rows;
}

export async function retrieveCandidates(db,queryVector,limit){
 const literal='['+queryVector.join(',')+']';
 const {rows}=await db.query(`select * from public.match_recommendation_candidates(
   $1::extensions.vector(1536),$2,$3,$4)`,[literal,EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION,limit]);
 const profiles=await loadRecommendationProfiles(db,rows.map(row=>row.profile_id));
 const byId=new Map(profiles.map(profile=>[profile.id,profile]));
 return rows.map(row=>candidateForReranking(byId.get(row.profile_id),row));
}
