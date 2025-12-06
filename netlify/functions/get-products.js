// netlify/functions/get-products.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function handler(event, context) {
  // Allow only GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      `SELECT id, category, name, description, unit_price, install_price, billing_type
       FROM home_security_products
       WHERE is_active = TRUE
       ORDER BY category, name`
    );

    client.release();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error('Error fetching products:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
