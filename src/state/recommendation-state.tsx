import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';
import type { NoStrongMatch, Recommendation } from '@/domain/recommendation';
import { newRecommendationRequestId, RecommendationError, recommendationErrorMessage, requestRecommendation, type RecommendationErrorCode } from '@/data/recommendations';
import { chooseStarterPrompts } from '@/features/recommendations/starter-prompts';

interface Value { draft:string; setDraft(value:string):void; starterPrompts:string[]; current:Recommendation|null; currentSituation:string|null; noMatch:NoStrongMatch|null; loading:boolean; error:string|null; errorCode:RecommendationErrorCode|null; submit():Promise<boolean>; showSaved(value:Recommendation):void; showHistory(value:Recommendation,situation:string):void; clearForAnother():void; clearError():void; }
const Context=createContext<Value|null>(null);
export function RecommendationStateProvider({children}:PropsWithChildren){
 const [draft,setDraftValue]=useState('');const [current,setCurrent]=useState<Recommendation|null>(null);const [loading,setLoading]=useState(false);
 const [noMatch,setNoMatch]=useState<NoStrongMatch|null>(null);
 const [currentSituation,setCurrentSituation]=useState<string|null>(null);
 const [errorText,setErrorText]=useState<string|null>(null);
 const [errorCode,setErrorCode]=useState<RecommendationErrorCode|null>(null);const inFlight=useRef<Promise<boolean>|null>(null);
 const retry=useRef<{requestId:string;situation:string}|null>(null);
 const [starterPrompts]=useState(()=>chooseStarterPrompts());
 const setDraft=useCallback((value:string)=>{setDraftValue(value.replace(/[\r\n]+/g,' ').slice(0,1500));setErrorCode(null);setErrorText(null);},[]);
 const submit=useCallback(async()=>{
  if(inFlight.current)return inFlight.current;
  const situation=draft.replace(/\s+/g,' ').trim();const requestId=retry.current?.situation===situation?retry.current.requestId:newRecommendationRequestId();
  const operation=(async()=>{setLoading(true);setErrorCode(null);try{const result=await requestRecommendation(situation,requestId);
    if(result.outcome==='match'){setCurrent(result);setCurrentSituation(situation);setNoMatch(null);}else{setCurrent(null);setCurrentSituation(null);setNoMatch(result);}retry.current=null;return true;}
   catch(problem){const issue=problem instanceof RecommendationError?problem:new RecommendationError('unavailable');setErrorCode(issue.code);
    setErrorText(recommendationErrorMessage(issue));retry.current=['network','timeout','busy','unavailable'].includes(issue.code)?{requestId,situation}:null;return false;}
   finally{setLoading(false);inFlight.current=null;}})();
  inFlight.current=operation;return operation;
 },[draft]);
 const clearForAnother=useCallback(()=>{setDraftValue('');setCurrent(null);setCurrentSituation(null);setNoMatch(null);setErrorCode(null);setErrorText(null);retry.current=null;},[]);
 const showResult=useCallback((value:Recommendation,situation:string|null)=>{setCurrent(value);setCurrentSituation(situation);setNoMatch(null);setErrorCode(null);setErrorText(null);},[]);
 return <Context.Provider value={{draft,setDraft,starterPrompts,current,currentSituation,noMatch,loading,error:errorText,errorCode,submit,
  showSaved:value=>showResult(value,null),showHistory:(value,situation)=>showResult(value,situation),clearForAnother,
  clearError:()=>{setErrorCode(null);setErrorText(null);}}}>{children}</Context.Provider>;
}
export function useRecommendation(){const value=useContext(Context);if(!value)throw new Error('useRecommendation requires RecommendationStateProvider.');return value;}
