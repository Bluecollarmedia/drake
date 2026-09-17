export const BULK_DEFAULTS=Object.freeze({
  concurrency:2,
  checkpointSize:25,
  maxFailures:5,
  requestCostReservationUsd:0.04,
  maxOutputTokens:4000,
  proposedSpendingCeilingUsd:4,
});

function optionValue(argv,name){
 const inline=argv.find(value=>value.startsWith(name+'='));
 if(inline)return inline.slice(name.length+1);
 const index=argv.indexOf(name);
 return index>=0?argv[index+1]:undefined;
}
function numberOption(argv,name,fallback,{min,max,integer=false}={}){
 const raw=optionValue(argv,name);
 const value=raw===undefined?fallback:Number(raw);
 if(!Number.isFinite(value)||(integer&&!Number.isInteger(value))||(min!==undefined&&value<min)||(max!==undefined&&value>max))throw new Error('invalid_option_'+name.slice(2));
 return value;
}
export function parseBulkOptions(argv){
 const prepareOnly=argv.includes('--prepare-only');
 const start=argv.includes('--start');
 if(prepareOnly===start)throw new Error('Choose exactly one of --prepare-only or --start');
 const spendingCeilingUsd=numberOption(argv,'--spending-ceiling-usd',prepareOnly?BULK_DEFAULTS.proposedSpendingCeilingUsd:undefined,{min:0.01,max:1000});
 if(start&&spendingCeilingUsd===undefined)throw new Error('--spending-ceiling-usd is required with --start');
 return {
  prepareOnly,start,spendingCeilingUsd,
  concurrency:numberOption(argv,'--concurrency',BULK_DEFAULTS.concurrency,{min:1,max:4,integer:true}),
  checkpointSize:numberOption(argv,'--checkpoint-size',BULK_DEFAULTS.checkpointSize,{min:1,max:100,integer:true}),
  maxFailures:numberOption(argv,'--max-failures',BULK_DEFAULTS.maxFailures,{min:1,max:100,integer:true}),
  requestCostReservationUsd:BULK_DEFAULTS.requestCostReservationUsd,
  maxOutputTokens:BULK_DEFAULTS.maxOutputTokens,
 };
}
export function budgetAllowsScheduling({estimatedCostUsd,reservedCostUsd,spendingCeilingUsd,requestCostReservationUsd}){
 return estimatedCostUsd+reservedCostUsd+requestCostReservationUsd<=spendingCeilingUsd+Number.EPSILON;
}
export function sanitizeWorkerError(error){return String(error?.message??error).replace(/sk-[A-Za-z0-9_-]+/g,'[REDACTED]').slice(0,2000);}
