import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {connectDatabase} from './lib/database.mjs';
import {DEFAULT_SHORTLIST_SIZE,RECOMMENDATION_VERSION} from '../server/recommendation/engine.mjs';
import {recommend} from '../server/recommendation/service.mjs';

const secret=JSON.parse((await readFile(new URL('../.secrets/analysis.local.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));
const apiKey=process.env.OPENAI_API_KEY||secret.OPENAI_API_KEY;
const allCases=JSON.parse(await readFile(new URL('../server/recommendation/evaluation-cases.json',import.meta.url),'utf8'));
const requestedArgument=process.argv.find(value=>value.startsWith('--case-ids='))?.slice('--case-ids='.length)??process.env.EVALUATION_CASE_IDS??'';
const requestedIds=new Set(String(requestedArgument).split(',').map(value=>value.trim()).filter(Boolean));
const cases=requestedIds.size?allCases.filter(item=>requestedIds.has(item.id)):allCases;
if(!cases.length)throw new Error('no_evaluation_cases_selected');
const shortlistSize=Math.max(5,Math.min(50,Number(process.env.RECOMMENDATION_SHORTLIST_SIZE||DEFAULT_SHORTLIST_SIZE)));
const outputDirectory=new URL('../artifacts/recommendations/',import.meta.url);await mkdir(outputDirectory,{recursive:true});
const db=await connectDatabase();const results=[];
try{
 for(const item of cases){
  try{
   const result=await recommend({db,apiKey,situation:item.situation,shortlistSize,safetyIdentifier:'eval-'+createHash('sha256').update(item.id).digest('hex').slice(0,32)});
   const selectedTitle=result.selected.title;
   const exactPass=!item.expectedTitles||item.expectedTitles.includes(selectedTitle);
   const prohibitedPass=!item.prohibitedTitles||!item.prohibitedTitles.includes(selectedTitle);
   results.push({...item,passed:exactPass&&prohibitedPass,finalRecommendation:selectedTitle,confidence:result.confidence,explanation:result.explanation,retrievedCandidates:result.retrievedCandidates.slice(0,10),rerankerDecision:{rankedCandidates:result.rankedCandidates,positiveMatches:result.positiveMatches,negativeMatches:result.negativeMatches,uncertainty:result.uncertainty},usage:result.usage,cost:result.cost,models:result.models});
   console.log(JSON.stringify({case:item.id,recommendation:selectedTitle,passed:exactPass&&prohibitedPass,costUsd:result.cost.totalUsd}));
  }catch(error){results.push({...item,passed:false,error:String(error?.message||error),cost:{embeddingUsd:0,rerankingUsd:0,totalUsd:0}});console.log(JSON.stringify({case:item.id,passed:false,error:String(error?.message||error)}));}
  await writeFile(new URL('evaluation-progress.json',outputDirectory),JSON.stringify({generatedAt:new Date().toISOString(),shortlistSize,cases:results},null,2));
 }
 const totals=results.reduce((sum,item)=>({embeddingUsd:sum.embeddingUsd+item.cost.embeddingUsd,rerankingUsd:sum.rerankingUsd+item.cost.rerankingUsd,totalUsd:sum.totalUsd+item.cost.totalUsd}),{embeddingUsd:0,rerankingUsd:0,totalUsd:0});
 const report={generatedAt:new Date().toISOString(),recommendationVersion:RECOMMENDATION_VERSION,shortlistSize,cases:results,summary:{total:results.length,passed:results.filter(item=>item.passed).length,failed:results.filter(item=>!item.passed).length,totalCostUsd:Number(totals.totalUsd.toFixed(8)),averageCostPerRecommendationUsd:Number((totals.totalUsd/results.length).toFixed(8)),embeddingCostUsd:Number(totals.embeddingUsd.toFixed(8)),rerankingCostUsd:Number(totals.rerankingUsd.toFixed(8))}};
 const reportName=requestedIds.size?'evaluation-targeted-report.json':'evaluation-report.json';
 await writeFile(new URL(reportName,outputDirectory),JSON.stringify(report,null,2));
 console.log(JSON.stringify({report:'artifacts/recommendations/'+reportName,summary:report.summary},null,2));
 if(report.summary.failed>0)process.exitCode=2;
}finally{await db.end();}
