// netlify/functions/admin-get-leads.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function handler(event, context) {
  // CORS + preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!password || password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const client = await pool.connect();

    // Fetch most recent estimates + lead info
    const result = await client.query(
      `
      SELECT
        e.id AS estimate_id,
        l.id AS lead_id,
        l.full_name,
        l.email,
        l.phone,
        l.zip_code,
        e.subtotal_products,
        e.subtotal_install,
        e.subtotal_monthly,
        e.total_upfront,
        e.created_at
      FROM estimates e
      JOIN leads l ON e.lead_id = l.id
      ORDER BY e.created_at DESC
      LIMIT 500
      `
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
    console.error('Error fetching admin leads:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
