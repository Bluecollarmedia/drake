import {createHash} from 'node:crypto';
import {buildRerankingInput,DEFAULT_SHORTLIST_SIZE,estimateEmbeddingCost,estimateRerankingCost,normalizeSituation} from './engine.mjs';
import {createEmbeddings,rerankRecommendation} from './openai.mjs';
import {retrieveCandidates} from './store.mjs';

export async function recommend({db,apiKey,situation,shortlistSize=DEFAULT_SHORTLIST_SIZE,safetyIdentifier}){
 const normalized=normalizeSituation(situation);
 const embedded=await createEmbeddings([normalized],apiKey);
 const candidates=await retrieveCandidates(db,embedded.vectors[0],shortlistSize);
 const reranked=await rerankRecommendation(buildRerankingInput(normalized,candidates),candidates.map(item=>item.songId),apiKey,{safetyIdentifier});
 const selected=candidates.find(item=>item.songId===reranked.result.selectedSongId);
 if(!selected)throw new Error('selected_candidate_missing');
 const embeddingTokens=Number(embedded.usage?.prompt_tokens||embedded.usage?.total_tokens||0);
 const embeddingCost=estimateEmbeddingCost(embeddingTokens),rerankingCost=estimateRerankingCost(reranked.usage);
 return {
  inputHash:createHash('sha256').update(normalized).digest('hex'),inputCharacterCount:normalized.length,
  selected:{songId:selected.songId,title:selected.title,version:selected.version},
  confidence:reranked.result.confidence,explanation:reranked.result.explanation,
  positiveMatches:reranked.result.positiveMatches,negativeMatches:reranked.result.negativeMatches,uncertainty:reranked.result.uncertainty,
  rankedCandidates:reranked.result.rankedCandidates,retrievedCandidates:candidates.map(item=>({songId:item.songId,title:item.title,retrievalScore:item.retrievalScore})),
  usage:{embeddingInputTokens:embeddingTokens,reranking:reranked.usage},
  cost:{embeddingUsd:embeddingCost,rerankingUsd:rerankingCost,totalUsd:embeddingCost+rerankingCost},
  models:{embedding:embedded.model,reranking:reranked.model},responseId:reranked.responseId,
 };
}
