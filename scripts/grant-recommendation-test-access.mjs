import {connectDatabase} from './lib/database.mjs';

const installationId=process.argv.find(value=>value.startsWith('--installation-id='))?.split('=')[1];
const userId=process.argv.find(value=>value.startsWith('--user-id='))?.split('=')[1];
const days=Number(process.argv.find(value=>value.startsWith('--days='))?.split('=')[1]??30);
if((installationId?1:0)+(userId?1:0)!==1||!Number.isInteger(days)||days<1||days>90){
 throw new Error('Use exactly one of --installation-id=<uuid> or --user-id=<uuid>, with optional --days=1..90.');
}
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
if(!uuid.test(installationId??userId))throw new Error('The supplied identifier is not a UUID.');
const db=await connectDatabase();
try{
 const targetColumn=installationId?'installation_id':'user_id',target=installationId??userId;
 const exists=await db.query(`select exists(select 1 from ${installationId?'public.installations':'auth.users'} where id=$1)`,[target]);
 if(!exists.rows[0].exists)throw new Error('That installation or user does not exist. Open the app first so it can register.');
 await db.query(`insert into public.recommendation_test_access(${targetColumn},label,active,expires_at)
   values($1,'Owner development testing',true,now()+$2*interval '1 day')
   on conflict(${targetColumn}) where ${targetColumn} is not null do update set active=true,expires_at=excluded.expires_at,label=excluded.label`,[target,days]);
 console.log(JSON.stringify({granted:true,target:targetColumn,expiresInDays:days},null,2));
}finally{await db.end();}
