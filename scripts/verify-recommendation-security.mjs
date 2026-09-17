import assert from 'node:assert/strict';
import {connectDatabase} from './lib/database.mjs';
import {EMBEDDING_DOCUMENT_VERSION,EMBEDDING_MODEL_ID,RECOMMENDATION_ANALYSIS_VERSION} from '../server/recommendation/engine.mjs';

const db=await connectDatabase();
try{
 const counts=(await db.query(`select
   (select count(*)::int from public.released_catalog_eligible_songs) eligible,
   (select count(*)::int from public.song_analysis_profiles where analysis_version=$1 and review_status in ('generated','needs_review','approved')) profiles,
   (select count(*)::int from (select song_id from public.song_embeddings where embedding_model=$2 and analysis_version=$1 and document_version=$3 group by song_id having count(distinct embedding_type)=2) complete) embedded_songs,
   (select count(*)::int from public.song_embeddings where embedding_model=$2 and analysis_version=$1 and document_version=$3) vectors,
   (select recommendations_enabled from public.usage_policies where id='default') recommendations_enabled`,[RECOMMENDATION_ANALYSIS_VERSION,EMBEDDING_MODEL_ID,EMBEDDING_DOCUMENT_VERSION])).rows[0];
 const privileges=(await db.query(`select
   has_table_privilege('authenticated','public.song_analysis_profiles','SELECT') profile_read,
   has_table_privilege('authenticated','public.song_embeddings','SELECT') embedding_read,
   has_table_privilege('authenticated','public.recommendation_runs','SELECT') run_read,
   has_table_privilege('authenticated','public.recommendation_runs','INSERT') run_insert,
   has_table_privilege('authenticated','public.recommendation_test_access','SELECT') test_access_read,
   has_table_privilege('authenticated','public.recommendation_test_access','INSERT') test_access_insert,
   has_function_privilege('authenticated','public.match_recommendation_candidates(extensions.vector,text,text,integer)','EXECUTE') retrieval_execute,
   has_function_privilege('authenticated','public.finish_recommendation_usage(uuid,text,jsonb,numeric)','EXECUTE') finish_execute`)).rows[0];
 assert.equal(counts.eligible,461);assert.equal(counts.profiles,461);assert.equal(counts.embedded_songs,461);assert.equal(counts.vectors,922);
 assert.equal(privileges.profile_read,false);assert.equal(privileges.embedding_read,false);assert.equal(privileges.run_read,false);assert.equal(privileges.run_insert,false);assert.equal(privileges.test_access_read,false);assert.equal(privileges.test_access_insert,false);assert.equal(privileges.retrieval_execute,false);assert.equal(privileges.finish_execute,false);
 assert.equal(typeof counts.recommendations_enabled,'boolean');
 console.log(JSON.stringify({counts,security:{semantic_profiles_client_read_denied:true,embeddings_client_read_denied:true,recommendation_runs_client_access_denied:true,test_access_client_access_denied:true,retrieval_rpc_client_execute_denied:true,usage_completion_client_execute_denied:true,kill_switch_present:true}},null,2));
}finally{await db.end();}
