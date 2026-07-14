import { db } from './src/config/db';

async function syncSequences() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    console.log('Syncing all PostgreSQL sequences...');
    
    for (const row of res.rows) {
      const tableName = row.table_name;
      const pkRes = await db.query(`
        SELECT a.attname
        FROM   pg_index i
        JOIN   pg_attribute a ON a.attrelid = i.indrelid
                             AND a.attnum = ANY(i.indkey)
        WHERE  i.indrelid = $1::regclass
        AND    i.indisprimary;
      `, [tableName]);
      
      if (pkRes.rows.length > 0) {
        const pkName = pkRes.rows[0].attname;
        const seqRes = await db.query(`
          SELECT pg_get_serial_sequence($1, $2) as seq_name
        `, [tableName, pkName]);
        
        const seqName = seqRes.rows[0]?.seq_name;
        if (seqName) {
          await db.query(`
            SELECT setval('${seqName}', COALESCE((SELECT MAX("${pkName}") + 1 FROM "${tableName}"), 1), false);
          `);
        }
      }
    }
    
    console.log('Sequences synced successfully!');
  } catch (error) {
    console.error('Error syncing sequences:', error);
  } finally {
    process.exit();
  }
}

syncSequences();
