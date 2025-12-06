// netlify/functions/admin-export-leads-csv.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function toCsvValue(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function handler(event, context) {
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
      `
    );

    client.release();

    const header = [
      'estimate_id',
      'lead_id',
      'full_name',
      'email',
      'phone',
      'zip_code',
      'subtotal_products',
      'subtotal_install',
      'subtotal_monthly',
      'total_upfront',
      'created_at',
    ];

    const lines = [];
    lines.push(header.join(','));

    for (const row of result.rows) {
      const line = [
        toCsvValue(row.estimate_id),
        toCsvValue(row.lead_id),
        toCsvValue(row.full_name),
        toCsvValue(row.email),
        toCsvValue(row.phone),
        toCsvValue(row.zip_code),
        toCsvValue(row.subtotal_products),
        toCsvValue(row.subtotal_install),
        toCsvValue(row.subtotal_monthly),
        toCsvValue(row.total_upfront),
        toCsvValue(row.created_at),
      ].join(',');
      lines.push(line);
    }

    const csv = lines.join('\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="homeguard_leads.csv"',
        'Access-Control-Allow-Origin': '*',
      },
      body: csv,
    };
  } catch (err) {
    console.error('Error exporting admin leads CSV:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
