import {connectDatabase} from './lib/database.mjs';
const argument=process.argv.find(value=>value.startsWith('--enabled='))?.split('=')[1];
if(!['true','false'].includes(argument))throw new Error('Use --enabled=true or --enabled=false.');
const enabled=argument==='true',db=await connectDatabase();
try{const result=await db.query('update public.usage_policies set recommendations_enabled=$1,updated_at=now() where id=\'default\' returning recommendations_enabled,updated_at',[enabled]);console.log(JSON.stringify(result.rows[0],null,2));}finally{await db.end();}
