// netlify/functions/submit-estimate.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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

  try {
    const body = JSON.parse(event.body || '{}');

    const { lead, items, notes } = body;
    if (!lead || !items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing lead or items' }),
      };
    }

    const { fullName, email, phone, zipCode } = lead;

    if (!fullName || !email || !zipCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, email, and zip are required' }),
      };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert lead
      const leadRes = await client.query(
        `INSERT INTO leads (full_name, email, phone, zip_code)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [fullName, email, phone || null, zipCode]
      );
      const leadId = leadRes.rows[0].id;

      // Fetch product pricing for all selected product IDs
      const productIds = items.map(i => i.productId);
      const productsRes = await client.query(
        `SELECT id, unit_price, install_price, billing_type
         FROM home_security_products
         WHERE id = ANY($1::int[])`,
        [productIds]
      );

      const productMap = new Map();
      for (const row of productsRes.rows) {
        productMap.set(row.id, row);
      }

      let subtotalProducts = 0;
      let subtotalInstall = 0;
      let subtotalMonthly = 0;

      // Prepare estimate_items inserts
      const estimateItemsValues = [];
      const estimateItemsParams = [];

      let paramIndex = 1;

      // We'll add estimate_id later after we create the estimate
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        const qty = Number(item.quantity) || 1;
        const lineProductsTotal = qty * Number(product.unit_price || 0);
        const lineInstallTotal = qty * Number(product.install_price || 0);
        const lineMonthlyTotal =
          product.billing_type === 'monthly'
            ? qty * Number(product.unit_price || 0)
            : 0;

        subtotalProducts += lineProductsTotal;
        subtotalInstall += lineInstallTotal;
        subtotalMonthly += lineMonthlyTotal;

        estimateItemsValues.push(
          `($1, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`
        );
        estimateItemsParams.push(
          item.productId,
          qty,
          lineProductsTotal,
          lineInstallTotal,
          lineMonthlyTotal
        );
        paramIndex += 5;
      }

      const totalUpfront = subtotalProducts + subtotalInstall;

      // Insert estimate
      const estimateRes = await client.query(
        `INSERT INTO estimates (lead_id, subtotal_products, subtotal_install, subtotal_monthly, total_upfront, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [leadId, subtotalProducts, subtotalInstall, subtotalMonthly, totalUpfront, notes || null]
      );
      const estimateId = estimateRes.rows[0].id;

      // Insert estimate_items if we have any
      if (estimateItemsValues.length > 0) {
        const queryText = `
          INSERT INTO estimate_items (
            estimate_id,
            product_id,
            quantity,
            line_products_total,
            line_install_total,
            line_monthly_total
          )
          VALUES ${estimateItemsValues.join(',')}
        `;
        await client.query(queryText, [estimateId, ...estimateItemsParams]);
      }

      await client.query('COMMIT');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          estimateId,
          leadId,
          summary: {
            subtotalProducts,
            subtotalInstall,
            subtotalMonthly,
            totalUpfront,
          },
        }),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error saving estimate:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save estimate' }),
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
