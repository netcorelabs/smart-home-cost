import { Client } from 'pg';

export async function handler(event, context) {
  const client = new Client({
    connectionString: process.env.NEON_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`
    SELECT dc.name AS category,
           dm.id,
           dm.model_name,
           dm.brand,
           dm.tier,
           dm.equipment_cost,
           dm.install_cost,
           dm.monitoring_monthly,
           dm.image_url,
           dm.affiliate_url
    FROM device_models dm
    INNER JOIN device_categories dc ON dm.category_id = dc.id
    WHERE dm.is_active = TRUE
    ORDER BY dc.name, dm.tier;
  `);
  await client.end();

  return {
    statusCode: 200,
    body: JSON.stringify(res.rows)
  };
}
