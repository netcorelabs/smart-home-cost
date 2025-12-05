// app/pricing/page.jsx
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function PricingPage() {
  // Fetch from Neon table "device_models"
  const deviceModels = await sql`
    SELECT id, brand, model_name, tier, price, image_url
    FROM device_models
    ORDER BY tier, price;
  `;

  return (
    <div>
      <h1>Smart Home Devices</h1>

      <ul>
        {deviceModels.map(device => (
          <li key={device.id}>
            <strong>{device.brand} {device.model_name}</strong><br />
            Tier: {device.tier}<br />
            Price: ${device.price}<br />
            {device.image_url && (
              <img src={device.image_url} alt={device.model_name} width="120" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
