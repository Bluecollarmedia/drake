import { connectDatabase } from './lib/database.mjs';
let client;
try {
  client = await connectDatabase();
  const { rows } = await client.query("select tablename from pg_tables where schemaname='public' order by tablename");
  console.log(JSON.stringify({ public_tables: rows.map(row => row.tablename) }));
} catch (error) {
  console.error(`Database inspection failed (${error.code ?? 'connection error'}).`);
  process.exitCode = 1;
} finally { await client?.end(); }
