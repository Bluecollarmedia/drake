import { createHash } from 'node:crypto';
export const ANALYSIS_VERSION='wd-song-intelligence-v1';
export const PROFILE_SCHEMA_VERSION=2;
export const CALIBRATION_TITLES=['Doing It Wrong','Headlines','Club Paradise','I Get Lonely','Fancy','Shut It Down','Over'];
export const MODEL_PRICING=Object.freeze({model:'gpt-5.4-mini',inputPerMillion:0.75,cachedInputPerMillion:0.075,outputPerMillion:4.5});
const stringArray={type:'array',items:{type:'string'},minItems:2,maxItems:12};
const nullableString={anyOf:[{type:'string'},{type:'null'}]};
const scenario={type:'object',additionalProperties:false,required:['text','type'],properties:{text:{type:'string',minLength:30,maxLength:600},type:{type:'string',minLength:2,maxLength:80}}};
const variation={type:'object',additionalProperties:false,required:['length','slang','specificity','emotionalAwareness','genderWording','relationshipWording','lifeCircumstances'],properties:{
 length:{type:'string'},slang:{type:'string'},specificity:{type:'string'},emotionalAwareness:{type:'string'},genderWording:{type:'string'},relationshipWording:{type:'string'},lifeCircumstances:{type:'string'}
}};
export const intelligenceSchema={type:'object',additionalProperties:false,
 required:['coreMeaning','detailedInterpretation','perspective','centralConflict','emotions','themes','tone','energyTone','emotionalDimensions','narratorState','otherPersonState','relationship','narrative','context','nuances','strongFitScenarios','moderateFitScenarios','negativeFitScenarios','exampleInputs','confidence','uncertainties','qualityAssessment'],
 properties:{
  coreMeaning:{type:'string',minLength:20,maxLength:500},detailedInterpretation:{type:'string',minLength:80,maxLength:1800},perspective:{type:'string',minLength:10,maxLength:500},centralConflict:{type:'string',minLength:15,maxLength:700},
  emotions:{type:'object',additionalProperties:false,required:['primary','secondary','intensity','direction'],properties:{primary:stringArray,secondary:stringArray,intensity:{type:'number',minimum:0,maximum:1},direction:{type:'string'}}},
  themes:{type:'object',additionalProperties:false,required:['primary','secondary'],properties:{primary:stringArray,secondary:stringArray}},tone:stringArray,energyTone:stringArray,
  emotionalDimensions:{type:'array',minItems:4,maxItems:24,items:{type:'object',additionalProperties:false,required:['name','value'],properties:{name:{type:'string',pattern:'^[a-z][a-z0-9_]*$'},value:{type:'number',minimum:0,maximum:1}}}},
  narratorState:{type:'object',additionalProperties:false,required:['emotions','motivation','awareness'],properties:{emotions:stringArray,motivation:{type:'string'},awareness:{type:'string'}}},
  otherPersonState:{type:'object',additionalProperties:false,required:['inferredState','certainty'],properties:{inferredState:nullableString,certainty:{type:'string'}}},
  relationship:{type:'object',additionalProperties:false,required:['applicable','type','stage','breakupType','whoLeft','mutuality','stillInLove','desiredOutcome','betrayal'],properties:{applicable:{type:'boolean'},type:nullableString,stage:nullableString,breakupType:nullableString,whoLeft:nullableString,mutuality:nullableString,stillInLove:nullableString,desiredOutcome:nullableString,betrayal:nullableString}},
  narrative:{type:'object',additionalProperties:false,required:['before','currentSituation','narratorWants','narratorFears','narratorRegrets'],properties:{before:{type:'string'},currentSituation:{type:'string'},narratorWants:{type:'string'},narratorFears:{type:'string'},narratorRegrets:{type:'string'}}},
  context:{type:'object',additionalProperties:false,required:['domains','lifeStage','setting','circumstances'],properties:{domains:stringArray,lifeStage:nullableString,setting:nullableString,circumstances:{type:'string'}}},
  nuances:{type:'array',items:{type:'string'},minItems:2,maxItems:12},strongFitScenarios:{type:'array',items:scenario,minItems:4,maxItems:8},moderateFitScenarios:{type:'array',items:scenario,minItems:2,maxItems:5},negativeFitScenarios:{type:'array',items:scenario,minItems:4,maxItems:8},
  exampleInputs:{type:'array',minItems:5,maxItems:8,items:{type:'object',additionalProperties:false,required:['text','variation'],properties:{text:{type:'string',minLength:5,maxLength:500},variation}}},
  confidence:{type:'number',minimum:0,maximum:1},uncertainties:{type:'array',items:{type:'string'},maxItems:8},
  qualityAssessment:{type:'object',additionalProperties:false,
   required:['evidenceSufficiency','recordingIdentity','drakePerformanceCredit','interpretationConflict','materialProfileRisk','materialReviewReasons'],
   properties:{
    evidenceSufficiency:{type:'string',enum:['sufficient','limited','insufficient']},
    recordingIdentity:{type:'string',enum:['clear','ambiguous','conflicting']},
    drakePerformanceCredit:{type:'string',enum:['clear','questionable','conflicting']},
    interpretationConflict:{type:'string',enum:['none','minor','material']},
    materialProfileRisk:{type:'boolean'},
    materialReviewReasons:{type:'array',items:{type:'string'},maxItems:6}
   }
  }
 }};
const requireText=(value,name,min=1)=>{if(typeof value!=='string'||value.trim().length<min)throw new Error('invalid_'+name);};
export function validateIntelligence(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('invalid_profile_object');
 for(const [key,min] of [['coreMeaning',20],['detailedInterpretation',80],['perspective',10],['centralConflict',15]])requireText(value[key],key,min);
 for(const key of ['primary','secondary'])if(!Array.isArray(value.emotions?.[key])||value.emotions[key].length<2)throw new Error('invalid_emotions_'+key);
 for(const key of ['primary','secondary'])if(!Array.isArray(value.themes?.[key])||value.themes[key].length<2)throw new Error('invalid_themes_'+key);
 for(const [key,min] of [['strongFitScenarios',4],['moderateFitScenarios',2],['negativeFitScenarios',4],['exampleInputs',5]])if(!Array.isArray(value[key])||value[key].length<min)throw new Error('invalid_'+key);
 if(typeof value.confidence!=='number'||value.confidence<0||value.confidence>1)throw new Error('invalid_confidence');
 const quality=value.qualityAssessment;
 if(!quality||!['sufficient','limited','insufficient'].includes(quality.evidenceSufficiency)||!['clear','ambiguous','conflicting'].includes(quality.recordingIdentity)||!['clear','questionable','conflicting'].includes(quality.drakePerformanceCredit)||!['none','minor','material'].includes(quality.interpretationConflict)||typeof quality.materialProfileRisk!=='boolean'||!Array.isArray(quality.materialReviewReasons))throw new Error('invalid_quality_assessment');
 const all=[...value.strongFitScenarios,...value.moderateFitScenarios,...value.negativeFitScenarios,...value.exampleInputs].map(x=>x.text.trim().toLowerCase());
 if(new Set(all).size!==all.length)throw new Error('duplicate_scenarios');
 const dimensions={};for(const d of value.emotionalDimensions||[]){if(!/^[a-z][a-z0-9_]*$/.test(d.name)||dimensions[d.name]!==undefined||d.value<0||d.value>1)throw new Error('invalid_emotional_dimensions');dimensions[d.name]=d.value;}
 if(Object.keys(dimensions).length<4)throw new Error('insufficient_emotional_dimensions');
 return {...value,dimensions};
}
export const stableHash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function requiresManualReview(profile,confidenceThreshold=.78){
 const quality=profile.qualityAssessment;
 return profile.confidence<confidenceThreshold||quality.evidenceSufficiency==='insufficient'||quality.recordingIdentity!=='clear'||quality.drakePerformanceCredit!=='clear'||quality.interpretationConflict==='material'||quality.materialProfileRisk||quality.materialReviewReasons.length>0;
}
export function estimateApiCost(usage,pricing=MODEL_PRICING){
 const input=Number(usage?.input_tokens??0),cached=Number(usage?.input_tokens_details?.cached_tokens??0),output=Number(usage?.output_tokens??0);
 return ((Math.max(0,input-cached)*pricing.inputPerMillion)+(cached*pricing.cachedInputPerMillion)+(output*pricing.outputPerMillion))/1_000_000;
}
export function buildAnalysisInput(song,calibration){
 const evidence=[];
 if(calibration)evidence.push({type:'curator_calibration',title:'Which Drake? seven-song calibration brief',notes:calibration.calibration,supports:calibration.supports});
 evidence.push(...(song.provider_links||[]).map(x=>({type:'catalog_metadata',title:'Catalog identity for '+song.title,url:x.url,notes:'Verified external recording identity '+x.provider+':'+x.provider_id+'. No lyrics supplied.',supports:['recording_identity']})));
 return {analysisVersion:ANALYSIS_VERSION,song:{id:song.id,title:song.title,version:song.version_key,artists:song.artists,releases:song.releases,providerLinks:song.provider_links},evidence,
  rules:['Analyze the actual identified recording using the supplied identity evidence and only contextual knowledge you can apply reliably; never infer meaning from the title alone.','Return original semantic summaries. Do not quote or paraphrase lyrics line by line.','Distinguish superficially similar situations with concrete negative matches.','Use null for relationship fields that do not apply.','Example inputs must sound like varied real people, not metadata tags.','Record ordinary interpretive nuance in uncertainties without requesting review.','Use materialReviewReasons only when uncertainty could materially damage recommendations: ambiguous recording/version, insufficient evidence, conflicting central interpretations, questionable Drake performance/credit, low confidence, or a likely-wrong profile.','If the recording is too recent or obscure to analyze reliably from available evidence, say so and mark evidence insufficient instead of inventing meaning.']};
}
